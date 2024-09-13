(function () {
  "use strict";

  // Constants
  const LOGO_URL = "https://raw.githubusercontent.com/zhyr/HaxiTAG-Assistant/main/icon/icon.png";
  const HAXITAG_ASSISTANT_ID = "haxitagAssistant";

  // Helper functions
  function addStyle(css) {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  function getValue(key, defaultValue) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, (result) => {
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      });
    });
  }

  function setValue(key, value) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

    const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.type === 'childList') {
        const addedNodes = mutation.addedNodes;
        for (let node of addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const input = findInputElement(node);
            if (input) {
              setupInputHandler(input);
              observer.disconnect(); // 找到输入框后停止观察
              return;
            }
          }
        }
      }
    }
  });
  // Localization
  const i18n = {
    en: {
      close: "Close",
      search: "Search",
      add: "Add",
      edit: "Edit",
      instruction: "Instruction",
      context: "Context",
      import: "Import",
      export: "Export",
      searchInstructionPlaceholder: "Search instruction...",
      addInstructionTitlePlaceholder: "Add instruction title",
      addInstructionDetailPlaceholder: "Add instruction detail",
      searchContextPlaceholder: "Search context...",
      contextTitlePlaceholder: "Context title",
      contextDetailPlaceholder: "Context detail",
      cancel: "Cancel",
      confirm: "Confirm",
      delete: "Delete",
      promptAddedSuccess: "Added successfully!",
      promptDeletedSuccess: "Deleted successfully!",
      promptCopiedSuccess: "Copied to clipboard!",
      promptCopyFailed: "Failed to copy. Please try again.",
      importSuccess: "Data imported successfully!",
      importFailed: "Failed to import data. Please check the file format.",
      exportSuccess: "Data exported successfully!",
      invalidFileFormat: "Invalid file format. Please select a JSON file.",
      language: "Language",
    },
    zh: {
      close: "关闭",
      search: "搜索",
      add: "添加",
      edit: "编辑",
      instruction: "指令",
      context: "上下文",
      import: "导入",
      export: "导出",
      searchInstructionPlaceholder: "搜索指令...",
      addInstructionTitlePlaceholder: "添加指令标题",
      addInstructionDetailPlaceholder: "添加指令详情",
      searchContextPlaceholder: "搜索上下文...",
      contextTitlePlaceholder: "上下文标题",
      contextDetailPlaceholder: "上下文详情",
      cancel: "取消",
      confirm: "确认",
      delete: "删除",
      promptAddedSuccess: "添加成功！",
      promptDeletedSuccess: "删除成功！",
      promptCopiedSuccess: "已复制到剪贴板！",
      promptCopyFailed: "复制失败，请重试。",
      importSuccess: "数据导入成功！",
      importFailed: "导入数据失败。请检查文件格式。",
      exportSuccess: "数据导出成功！",
      invalidFileFormat: "无效的文件格式。请选择JSON文件。",
      language: "语言",
    },
  };

  async function getLanguage() {
    return await getValue("language", "zh");
  }

  function setLanguage(lang) {
    return setValue("language", lang);
  }

  async function _(key) {
    const lang = await getLanguage();
    return i18n[lang]?.[key] || i18n.en[key] || key;
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "rgba(0, 102, 255, 0.9)",
      color: "white",
      padding: "10px",
      borderRadius: "5px",
      zIndex: "10002",
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  function getTextArea() {
    const hostname = window.location.hostname;
    if (hostname === "chat.openai.com" || hostname === "chatgpt.com") {
      return document.querySelector('#prompt-textarea');
    } else if (hostname === "claude.ai") {
      return document.querySelector('div[contenteditable="true"]');
    } else if (hostname === "kimi.moonshot.cn") {
      return document.querySelector('.editor___KShcc .editorContentEditable___FZJd9');
    } else if (hostname === "tongyi.aliyun.com") {
      return document.querySelector(".ant-input.textarea--g7EUvnQR");
    } else if (hostname === "chatglm.cn") {
      return document.querySelector('.input-box-inner textarea');
    }
    return null;
  }  
  
  function triggerInputEvent(textarea) {
    const inputEvent = new Event("input", { bubbles: true, cancelable: true });
    const changeEvent = new Event("change", { bubbles: true, cancelable: true });
  
    textarea.dispatchEvent(inputEvent);
    textarea.dispatchEvent(changeEvent);
  
    const hostname = window.location.hostname;
    if (hostname === "chatgpt.com" || hostname === "chat.openai.com" || 
        hostname === "chatglm.cn" || hostname === "tongyi.aliyun.com" || 
        hostname === "kimi.moonshot.cn") {
      // Simulate React's onChange event
      if (textarea.tagName.toLowerCase() === 'textarea') {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value"
        ).set;
        nativeInputValueSetter.call(textarea, textarea.value);
      }
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  class HaxitagAssistant {
    constructor() {
      this.isOpen = false;
      this.currentTab = "instruction";
      this.init();
    }

    async init() {
      this.instructions = await getValue("instructions", []);
      this.contexts = await getValue("contexts", []);
      await this.initUI();
      this.bindEvents();
    }

    async initUI() {
      const rootEle = document.createElement("div");
      rootEle.id = HAXITAG_ASSISTANT_ID;
      const isClaudeAI = window.location.hostname === "claude.ai";

      const instructionText = await _("instruction");
      const contextText = await _("context");
      const searchText = await _("search");
      const addText = await _("add");
      const editText = await _("edit");
      const importText = await _("import");
      const exportText = await _("export");
      const cancelText = await _("cancel");
      const confirmText = await _("confirm");
      const searchInstructionPlaceholder = await _("searchInstructionPlaceholder");
      const addInstructionTitlePlaceholder = await _("addInstructionTitlePlaceholder");
      const addInstructionDetailPlaceholder = await _("addInstructionDetailPlaceholder");
      const searchContextPlaceholder = await _("searchContextPlaceholder");
      const contextTitlePlaceholder = await _("contextTitlePlaceholder");
      const contextDetailPlaceholder = await _("contextDetailPlaceholder");

      rootEle.innerHTML = `
        <div id="haxitagAssistantOpen">
          ${isClaudeAI ? "<span>HaxiTAG<br>Assistant</span>" : `<img src="${LOGO_URL}" alt="HaxiTAG Logo" onerror="this.onerror=null;this.parentNode.innerHTML='<span>HaxiTAG<br>Assistant</span>';">`}
        </div>
        <div id="haxitagAssistantMain">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px;">
            <h2>HaxiTAG Assistant</h2>
            <select id="languageSelector">
              <option value="zh">🀄️</option>
              <option value="en">🔠</option>
            </select>
            <button id="haxitagAssistantClose" class="close-button">&times;</button>
          </div>
          <div id="tabContainer">
            <button class="tab-button active" data-tab="instruction">${instructionText}</button>
            <button class="tab-button" data-tab="context">${contextText}</button>
          </div>
          <div id="instructionTab" class="tab-content active">
            <div class="function-buttons">
              <button id="instructionSearchButton" class="function-button">${searchText}</button>
              <button id="instructionAddButton" class="function-button">${addText}</button>
              <button id="instructionEditButton" class="function-button">${editText}</button>
              <button id="instructionImportButton" class="function-button">${importText}</button>
              <button id="instructionExportButton" class="function-button">${exportText}</button>
            </div>
            <input type="text" id="instructionSearchInput" placeholder="${searchInstructionPlaceholder}" style="display: none;">
            <div class="add-prompt-form" id="instructionAddForm" style="display: none;">
              <input type="text" id="instructionName" placeholder="${addInstructionTitlePlaceholder}">
              <textarea id="instructionDetail" placeholder="${addInstructionDetailPlaceholder}"></textarea>
              <button id="instructionCancelAdd">${cancelText}</button>
              <button id="instructionConfirmAdd">${confirmText}</button>
            </div>
            <ul id="instructionList" style="list-style-type: none; padding: 0;"></ul>
          </div>
          <div id="contextTab" class="tab-content">
            <div class="function-buttons">
              <button id="contextSearchButton" class="function-button">${searchText}</button>
              <button id="contextAddButton" class="function-button">${addText}</button>
              <button id="contextEditButton" class="function-button">${editText}</button>
              <button id="contextImportButton" class="function-button">${importText}</button>
              <button id="contextExportButton" class="function-button">${exportText}</button>
            </div>
            <input type="text" id="contextSearchInput" placeholder="${searchContextPlaceholder}" style="display: none;">
            <div class="add-prompt-form" id="contextAddForm" style="display: none;">
              <input type="text" id="contextName" placeholder="${contextTitlePlaceholder}">
              <textarea id="contextDetail" placeholder="${contextDetailPlaceholder}"></textarea>
              <button id="contextCancelAdd">${cancelText}</button>
              <button id="contextConfirmAdd">${confirmText}</button>
            </div>
            <ul id="contextList" style="list-style-type: none; padding: 0;"></ul>
          </div>
          <input type="file" id="importFile" style="display: none;" accept=".json">
        </div>
      `;
      document.body.appendChild(rootEle);

      this.cacheElements();
      await this.updateLists();
      await this.updateLanguage();
    }

    cacheElements() {
      this.elements = {
        main: document.querySelector("#haxitagAssistantMain"),
        open: document.querySelector("#haxitagAssistantOpen"),
        close: document.querySelector("#haxitagAssistantClose"),
        tabButtons: document.querySelectorAll(".tab-button"),
        tabContents: document.querySelectorAll(".tab-content"),
        instructionSearchButton: document.querySelector("#instructionSearchButton"),
        instructionAddButton: document.querySelector("#instructionAddButton"),
        instructionEditButton: document.querySelector("#instructionEditButton"),
        instructionImportButton: document.querySelector("#instructionImportButton"),
        instructionExportButton: document.querySelector("#instructionExportButton"),
        instructionSearchInput: document.querySelector("#instructionSearchInput"),
        instructionAddForm: document.querySelector("#instructionAddForm"),
        instructionList: document.querySelector("#instructionList"),
        contextSearchButton: document.querySelector("#contextSearchButton"),
        contextAddButton: document.querySelector("#contextAddButton"),
        contextEditButton: document.querySelector("#contextEditButton"),
        contextImportButton: document.querySelector("#contextImportButton"),
        contextExportButton: document.querySelector("#contextExportButton"),
        contextSearchInput: document.querySelector("#contextSearchInput"),
        contextAddForm: document.querySelector("#contextAddForm"),
        contextList: document.querySelector("#contextList"),
        importFile: document.querySelector("#importFile"),
        languageSelector: document.querySelector("#languageSelector"),
      };
    }

    bindEvents() {
      this.elements.open.addEventListener("click", () => this.toggleHelper());
      this.elements.close.addEventListener("click", () => this.toggleHelper());
      this.elements.tabButtons.forEach((button) => {
        button.addEventListener("click", (e) => this.switchTab(e.target.dataset.tab));
      });

      // Instruction tab events
      this.elements.instructionSearchButton.addEventListener("click", () => this.toggleSearch("instruction"));
      this.elements.instructionAddButton.addEventListener("click", () => this.toggleAddForm("instruction"));
      this.elements.instructionEditButton.addEventListener("click", () => this.toggleEditMode("instruction"));
      this.elements.instructionImportButton.addEventListener("click", () => this.importData("instruction"));
      this.elements.instructionExportButton.addEventListener("click", () => this.exportData("instruction"));
      this.elements.instructionSearchInput.addEventListener("input", (e) => this.handleSearch(e, "instruction"));
      this.elements.instructionList.addEventListener("click", (e) => this.handleListClick(e, "instruction"));

      // Context tab events
      this.elements.contextSearchButton.addEventListener("click", () => this.toggleSearch("context"));
      this.elements.contextAddButton.addEventListener("click", () => this.toggleAddForm("context"));
      this.elements.contextEditButton.addEventListener("click", () => this.toggleEditMode("context"));
      this.elements.contextImportButton.addEventListener("click", () => this.importData("context"));
      this.elements.contextExportButton.addEventListener("click", () => this.exportData("context"));
      this.elements.contextSearchInput.addEventListener("input", (e) => this.handleSearch(e, "context"));
      this.elements.contextList.addEventListener("click", (e) => this.handleListClick(e, "context"));

      // Import file change event
      this.elements.importFile.addEventListener("change", (e) => this.handleFileImport(e));

      // Add form events
      document.querySelector("#instructionConfirmAdd").addEventListener("click", () => this.addNewPrompt("instruction"));
      document.querySelector("#instructionCancelAdd").addEventListener("click", () => this.toggleAddForm("instruction"));
      document.querySelector("#contextConfirmAdd").addEventListener("click", () => this.addNewPrompt("context"));
      document.querySelector("#contextCancelAdd").addEventListener("click", () => this.toggleAddForm("context"));

// Language selector event
      this.elements.languageSelector.addEventListener("change", (e) => this.changeLanguage(e.target.value));

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === "KeyF") {
          e.preventDefault();
          this.toggleHelper();
        }
        if (e.code === "Escape" && this.isOpen) {
          this.toggleHelper();
        }
      });

      // Click outside to close
      document.addEventListener("click", (e) => {
        if (
          this.isOpen &&
          !e.target.closest("#haxitagAssistantMain") &&
          !e.target.closest("#haxitagAssistantOpen")
        ) {
          this.toggleHelper();
        }
      });
    }

    async changeLanguage(lang) {
      await setLanguage(lang);
      await this.updateLanguage();
    }

    async updateLanguage() {
      const lang = await getLanguage();
      this.elements.languageSelector.value = lang;
      this.elements.tabButtons[0].textContent = await _("instruction");
      this.elements.tabButtons[1].textContent = await _("context");
      this.elements.instructionSearchButton.textContent = await _("search");
      this.elements.instructionAddButton.textContent = await _("add");
      this.elements.instructionEditButton.textContent = await _("edit");
      this.elements.instructionImportButton.textContent = await _("import");
      this.elements.instructionExportButton.textContent = await _("export");
      this.elements.contextSearchButton.textContent = await _("search");
      this.elements.contextAddButton.textContent = await _("add");
      this.elements.contextEditButton.textContent = await _("edit");
      this.elements.contextImportButton.textContent = await _("import");
      this.elements.contextExportButton.textContent = await _("export");
      this.elements.instructionSearchInput.placeholder = await _("searchInstructionPlaceholder");
      this.elements.contextSearchInput.placeholder = await _("searchContextPlaceholder");
      document.querySelector("#instructionName").placeholder = await _("addInstructionTitlePlaceholder");
      document.querySelector("#instructionDetail").placeholder = await _("addInstructionDetailPlaceholder");
      document.querySelector("#contextName").placeholder = await _("contextTitlePlaceholder");
      document.querySelector("#contextDetail").placeholder = await _("contextDetailPlaceholder");
      document.querySelector("#instructionCancelAdd").textContent = await _("cancel");
      document.querySelector("#instructionConfirmAdd").textContent = await _("confirm");
      document.querySelector("#contextCancelAdd").textContent = await _("cancel");
      document.querySelector("#contextConfirmAdd").textContent = await _("confirm");
      await this.updateLists();
    }

    switchTab(tabName) {
      this.currentTab = tabName;
      this.elements.tabButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.tab === tabName);
      });
      this.elements.tabContents.forEach((content) => {
        content.classList.toggle("active", content.id === `${tabName}Tab`);
      });
    }

    toggleSearch(type) {
      const searchInput = this.elements[`${type}SearchInput`];
      searchInput.style.display = searchInput.style.display === "none" ? "block" : "none";
      if (searchInput.style.display === "block") {
        searchInput.focus();
      }
    }

    toggleAddForm(type) {
      const addForm = this.elements[`${type}AddForm`];
      addForm.style.display = addForm.style.display === "none" ? "block" : "none";
    }

    toggleEditMode(type) {
      const list = this.elements[`${type}List`];
      const isEditMode = list.classList.toggle("edit-mode");
      list.querySelectorAll(".delete-button").forEach((btn) => {
        btn.style.display = isEditMode ? "inline" : "none";
      });
    }

    handleSearch(event, type) {
      const searchTerm = event.target.value.toLowerCase();
      const list = this.elements[`${type}List`];
      list.querySelectorAll("li").forEach((li) => {
        const promptName = li.textContent.toLowerCase();
        li.style.display = promptName.includes(searchTerm) ? "block" : "none";
      });
    }

    async handleListClick(event, type) {
      if (event.target.classList.contains("delete-button")) {
        const li = event.target.closest("li");
        const index = Array.from(li.parentNode.children).indexOf(li);
        this[`${type}s`].splice(index, 1);
        await setValue(`${type}s`, this[`${type}s`]);
        await this.updateLists();
        showToast(await _("promptDeletedSuccess"));
      } else if (event.target.nodeName === "LI") {
        const value = event.target.getAttribute("data-value");
        if (value) {
          const decodedValue = decodeURIComponent(value);
          const hostname = window.location.hostname;
          if (
            hostname === "chat.openai.com" ||
            hostname === "chatgpt.com" ||
            hostname === "claude.ai"
          ) {
            this.insertValueIntoTextArea(decodedValue);
          } else {
            this.copyToClipboard(decodedValue);
          }
        }
      }
    }

    function insertValueIntoTextArea(value) {
      const textareaEle = getTextArea();
      if (textareaEle) {
        const hostname = window.location.hostname;
        if (hostname === "chat.openai.com" || hostname === "chatgpt.com") {
          // For ChatGPT's new interface
          if (textareaEle.tagName.toLowerCase() === 'div') {
            // Clear placeholder if present
            const placeholder = textareaEle.querySelector('p.placeholder');
            if (placeholder) {
              placeholder.remove();
            }
            // Insert text
            const p = document.createElement('p');
            p.textContent = value;
            textareaEle.appendChild(p);
          } else {
            // Fallback for textarea
            textareaEle.value += value + "\n\n";
          }
          textareaEle.dispatchEvent(new Event('input', { bubbles: true }));
        } else if (hostname === "claude.ai" || hostname === "kimi.moonshot.cn") {
          // For Claude and Kimi interfaces
          const currentContent = textareaEle.textContent;
          textareaEle.textContent = currentContent + value + "\n\n";
          textareaEle.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          // For other interfaces
          const currentValue = textareaEle.value;
          const newValue = currentValue + value + "\n\n";
          textareaEle.value = newValue;
          textareaEle.style.height = "auto";
          textareaEle.style.height = textareaEle.scrollHeight + "px";
        }
        
        // Focus and move cursor to end
        textareaEle.focus();
        if (textareaEle.setSelectionRange) {
          textareaEle.setSelectionRange(textareaEle.value.length, textareaEle.value.length);
        } else {
          // For contenteditable divs (ChatGPT, Claude, Kimi)
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(textareaEle);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
        
        triggerInputEvent(textareaEle);
      }
    }    
    
    async copyToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          showToast(await _("promptCopiedSuccess"));
          this.focusAndPositionCursor();
        } catch (err) {
          showToast(await _("promptCopyFailed"));
        }
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand("copy");
          showToast(await _("promptCopiedSuccess"));
          this.focusAndPositionCursor();
        } catch (err) {
          showToast(await _("promptCopyFailed"));
        }
        document.body.removeChild(textarea);
      }
    }

    focusAndPositionCursor() {
      const textareaEle = getTextArea();
      if (textareaEle) {
        textareaEle.focus();
        const currentValue = textareaEle.value;
        textareaEle.value = currentValue + "\n\n";
        textareaEle.setSelectionRange(textareaEle.value.length, textareaEle.value.length);
      }
    }

    importData(type) {
      this.elements.importFile.dataset.importType = type;
      this.elements.importFile.click();
    }

    async handleFileImport(event) {
      const file = event.target.files[0];
      const type = event.target.dataset.importType;
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target.result);
            if (Array.isArray(data)) {
              this[`${type}s`] = data;
              await setValue(`${type}s`, this[`${type}s`]);
              await this.updateLists();
              showToast(await _("importSuccess"));
            } else {
              throw new Error("Invalid format");
            }
          } catch (error) {
            showToast(await _("importFailed"));
          }
        };
        reader.readAsText(file);
      } else {
        showToast(await _("invalidFileFormat"));
      }
    }

    async exportData(type) {
      const dataStr = JSON.stringify(this[`${type}s`]);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `haxitag_${type}s.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
      showToast(await _("exportSuccess"));
    }

    async updateLists() {
      await this.updateList("instruction");
      await this.updateList("context");
    }

    async updateList(type) {
      const ul = this.elements[`${type}List`];
      const deleteText = await _("delete");
      ul.innerHTML = this[`${type}s`]
        .map(
          ([label, value]) => `
            <li data-value="${encodeURIComponent(value)}">
              ${label}
              <button class="delete-button" style="display: none;">${deleteText}</button>
            </li>
          `,
        )
        .join("");
    }

    async addNewPrompt(type) {
      const nameInput = document.querySelector(`#${type}Name`);
      const detailInput = document.querySelector(`#${type}Detail`);
      const name = nameInput.value.trim();
      const detail = detailInput.value.trim();

      if (name && detail) {
        this[`${type}s`].push([name, detail]);
        await setValue(`${type}s`, this[`${type}s`]);
        await this.updateLists();
        this.toggleAddForm(type);
        nameInput.value = "";
        detailInput.value = "";
        showToast(await _("promptAddedSuccess"));
      }
    }

    toggleHelper() {
      if (!this.isOpen) {
        this.elements.main.style.transform = "translateX(0)";
        this.elements.open.style.opacity = "0.5";
        this.isOpen = true;
      } else {
        this.elements.main.style.transform = "translateX(100%)";
        this.elements.open.style.opacity = "1";
        this.isOpen = false;
      }
    }
  }

  // Styles
  addStyle(`
    #haxitagAssistantOpen {
      position: fixed;
      top: 50%;
      right: 10px;
      color: #000000 !important;
      z-index: 10000 !important;
      padding: 10px;
      cursor: pointer;
      border-radius: 5px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    #haxitagAssistantOpen img {
      width: 40px;
      height: 40px;
      margin-bottom: 5px;
    }
    #haxitagAssistantOpen span {
      background-color: #33CCFF;
      padding: 5px;
      border-radius: 3px;
      text-align: center;
      color: #000000;
      font-weight: bold;
      font-size: 14px;
      white-space: normal;
      word-wrap: break-word;
      width: 90px;
    }
    #haxitagAssistantMain {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 333px;
      background-color: rgba(51, 51, 51, 0.9);
      color: #FFFFFF !important;
      z-index: 10001 !important;
      padding: 10px;
      transform: translateX(100%);
      transition: transform 0.2s;
      overflow-y: auto;
      box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    }
    #tabContainer {
      display: flex;
      margin-bottom: 10px;
    }
    .tab-button {
      flex: 1;
      padding: 8px;
      border: none;
      color: white;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .tab-button[data-tab="instruction"] {
      background-color: rgba(0, 102, 255, 0.8);
    }
    .tab-button[data-tab="context"] {
      background-color: rgba(51, 204, 255, 0.8);
    }
    .tab-button:first-child {
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
    }
    .tab-button:last-child {
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
    .function-buttons {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      padding: 5px;
    }
    #instructionTab .function-buttons {
      border: 1px solid #0066FF;
    }
    #contextTab .function-buttons {
      border: 1px solid #33CCFF;
    }
    #instructionTab .function-button {
      color: white !important;
    }
    #contextTab .function-button {
      color: rgba(51, 204, 255, 0.9) !important;
    }
    .function-button {
      background: none !important;
      border: none;
      cursor: pointer;
      font-size: 14px;
      padding: 5px;
    }
    .function-button:hover {
      text-decoration: underline;
    }
    #instructionSearchInput, #contextSearchInput {
      width: 100%;
      margin-bottom: 10px;
      padding: 8px;
      background-color: rgba(255, 255, 255, 0.8) !important;
      color: #333333 !important;
      border-radius: 3px;
    }
    #instructionSearchInput {
      border: 1px solid #0066FF;
    }
    #contextSearchInput {
      border: 1px solid #33CCFF;
    }
 .add-prompt-form {
      margin-top: 10px;
    }
    .add-prompt-form input, .add-prompt-form textarea {
      width: 100%;
      margin-bottom: 10px;
      padding: 8px;
      background-color: rgba(255, 255, 255, 0.8) !important;
      color: #333333 !important;
      border-radius: 3px;
    }
    #instructionTab .add-prompt-form input, #instructionTab .add-prompt-form textarea {
      border: 1px solid #0066FF;
    }
    #contextTab .add-prompt-form input, #contextTab .add-prompt-form textarea {
      border: 1px solid #33CCFF;
    }
    .add-prompt-form textarea {
      height: 100px;
      resize: vertical;
    }
    .add-prompt-form button {
      margin-right: 10px;
      padding: 6px 10px;
      cursor: pointer;
      border-radius: 3px;
      border: none;
      color: white !important;
      transition: background-color 0.3s;
    }
    #instructionTab .add-prompt-form button {
      background-color: rgba(0, 102, 255, 0.8) !important;
    }
    #contextTab .add-prompt-form button {
      background-color: rgba(51, 204, 255, 0.8) !important;
    }
    .add-prompt-form button:hover {
      opacity: 0.8;
    }
    #instructionList li, #contextList li {
      background-color: rgba(255, 255, 255, 0.1) !important;
      color: #FFFFFF !important;
      margin-bottom: 10px;
      padding: 8px;
      cursor: pointer;
      border-radius: 3px;
      position: relative;
      transition: background-color 0.3s;
    }
    #instructionList li {
      border: 1px solid rgba(0, 102, 255, 0.8);
    }
    #contextList li {
      border: 1px solid rgba(51, 204, 255, 0.8);
    }
    #instructionList li:hover, #contextList li:hover {
      background-color: rgba(255, 255, 255, 0.2) !important;
    }
    .delete-button {
      position: absolute;
      right: 5px;
      top: 50%;
      transform: translateY(-50%);
      background-color: rgba(255, 51, 51, 0.8) !important;
      color: white !important;
      padding: 2px 5px;
      cursor: pointer;
      border-radius: 3px;
      border: none;
      transition: background-color 0.3s;
    }
    .delete-button:hover {
      background-color: rgba(255, 102, 102, 0.8) !important;
    }
    .close-button {
      background: none;
      border: none;
      color: #FFFFFF;
      font-size: 24px;
      cursor: pointer;
    }
    #languageSelector {
      background-color: rgba(255, 255, 255, 0.1);
      color: #FFFFFF;
      border: 0px solid #0066FF;
      padding: 5px;
      border-radius: 3px;
      cursor: pointer;
    }
    #languageSelector option {
      background-color: #000000;
      color: #FFFFFF;
    }

    /* Claude AI specific styles */
    body[data-page-type="chat"] #haxitagAssistantOpen {
      white-space: normal;
      word-wrap: break-word;
      width: 90px;
      border: 1px solid #FFFFFF;
      background-color: #33CCFF;
      padding: 5px;
    }
    body[data-page-type="chat"] #haxitagAssistantOpen span {
      color: #000000;
      font-weight: bold;
      font-size: 14px;
      text-align: center;
    }
    
  /* ChatGLM specific styles */
  body[data-page-type="chat"] #haxitagAssistantOpen {
    z-index: 1002; /* Ensure it's above ChatGLM's elements */
  }

  body[data-page-type="chat"] #haxitagAssistantMain {
    z-index: 1003; /* Ensure it's above ChatGLM's elements */
  }

  /* Adjust the position of the open button for ChatGLM */
  body[data-page-type="chat"] #haxitagAssistantOpen {
    top: 70px; /* Adjust as needed */
    right: 20px;
  }  
  `);

  const observer = new MutationObserver((mutations) => {
    for (let mutation of mutations) {
      if (mutation.type === 'childList') {
        const addedNodes = mutation.addedNodes;
        for (let node of addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('input-box-inner')) {
            // Reinitialize or update HaxiTAG Assistant if necessary
            if (!document.querySelector(`#${HAXITAG_ASSISTANT_ID}`)) {
              new HaxitagAssistant();
              console.log("HaxiTAG Assistant has been loaded after dynamic content change!");
            }
            observer.disconnect(); // Stop observing once we've found our target
            return;
          }
        }
      }
    }
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  // Initialize the assistant
  window.addEventListener("load", function () {
    if (!document.querySelector(`#${HAXITAG_ASSISTANT_ID}`)) {
      new HaxitagAssistant();
      console.log("HaxiTAG Assistant has been loaded!");
    }
  });
})();