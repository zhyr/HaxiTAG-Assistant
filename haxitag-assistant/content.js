// ==UserScript==
// @name          HaxiTAG Assistant
// @version       0.7.1
// @description   HaxiTAG AI助手小工具,支持ChatGPT、Claude、Kimi和通义千问
// @author        rye (modified)
// @detail        https://www.haxitag.ai/p/application-suite.html
// @match         *://chat.openai.com/*
// @match         *://chatgpt.com/*
// @match         *://claude.ai/*
// @match         *://kimi.moonshot.cn/*
// @match         *://tongyi.aliyun.com/*
// @grant         none
// @run-at        document-end
// @license       MIT
// ==/UserScript==

(function () {
  "use strict";

  window.addEventListener("load", function () {
    if (document.querySelector("#haxitagAssistant")) {
      return;
    }

    function safeQuerySelector(selector) {
      try {
        return document.querySelector(selector);
      } catch (error) {
        console.error(`Invalid selector: ${selector}`, error);
        return null;
      }
    }

    (function () {
      const originalQuerySelectorAll = Element.prototype.querySelectorAll;
      Element.prototype.querySelectorAll = function (selector) {
        try {
          return originalQuerySelectorAll.apply(this, arguments);
        } catch (e) {
          if (selector === "*,:x") {
            // 返回一个空的 NodeList
            return document.createDocumentFragment().childNodes;
          }
          throw e;
        }
      };
    })();

    const SHORTCUTS = [
      [
        "PPT中翻英优化",
        "Please translate context to English with academic writing and professional knowledge, improve the spelling, grammar, clarity, concision and overall readability，Demonstrating the focus, professionalism and authority of context. When necessary, rewrite the whole sentence. Further, provide three related question and answer to expend the comparehension as the end.follow the form of context.Simplofy contextand optimize the presentation，Give more accurate and professional PPT wording.\n\n context:{{}}",
      ],
      [
        "🀄️⇨🔠信达雅翻译",
        "作为一个英语翻译团队的领导。你收到{{context}}会安排团队成员和{{context}}领域专家进行合作翻译, 实现{{context}}翻译达到'信达雅'效果和目标。团队成员分别从英语文化、{{context}}专业内容、知识准确性和事实核的角度，进行翻译和检查，考虑文化, 语境, 语义, 思考文字背后想要表达的意思, 进行意译, 力求意境契合。之后，你再审阅翻译的结果是否满足, 并给出你的审校修改结论。记得分开思考和翻译内容。注意: 思考部分,请使用 【思考】 开头，翻译结果请使用【翻译】开头。请严格遵守以上工作流程， 对以下{{context}}文字进行翻译，用英语输出：context:{{ }}",
      ],
      [
        "深入挖掘知识",
        "作为{{context}}领域的专家，基于{{context}}提供的信息和知识，总结{{context}}的方法、步骤以及从零开始，实现{{context}}目标的流程步骤，并且提供一个参考思想和方法，实现对{{context}}的结果进行判断和评价.\n\ncontext:{{}}",
      ],
      [
        "生成问答对",
        "作为阅读理解的高手，请针对{{context}}的内容，阅读理解后，提出三个最重要的问题，并从文中的信息找到答案，组织出回答。\n\ncontext:{{context}}",
      ],
      [
        "阅读理解助手",
        "After in-depth reading and understanding, as an expert in the context field, you need to write professional understanding and analysis evaluation. Additional time is needed to review again and again, to ensure an accurate understanding of the literal expression of the context and the expertise therein, including even the author's thoughts and authoritative opinions.output your think about the article, telling people about contextual thinking, methodology, contextual characteristics, technology and applied research, the growth of business and technology ecosystems, and possible potential pitfalls, and even the author's knowledge and awareness, with the aim of attracting more relevant people participate.Then output these your view in Chinese.Briefing: context summary Keypoint: key points.Your point: your point of view.Briefing, Keypoint, important fact and Your point are important signs and signals to identify the beginning of the content, so they must be kept at this position.output in Chinese.\n\ncontext:\n",
      ],
      [
        "生成FAQ",
        "Entirely Unique, Original and Fully SEO Tuned Articles with Meta Description, Headings, 1500 Words Length, FAQ's, Meta Description & Much more.\n\ncontext:{{context}}",
      ],
      [
        "视频字幕整理",
        "Please send me the raw transcript of your video {{context}}. I will format it to be more readable by doing the following:1. Extracting chapters based on topics as subheadings.2. Formatting the transcript into appropriate paragraphs without summarizing or omitting any content.3. Ensuring no content is removed.4.Fix typos, wrap intonation and redundancies in [] to indicate that they can be left out without affecting the meaning, correctness and accuracy.Special note: Only add subheadings and paragraph breaks, do not remove or summarize any content.output in Chinese.context:\n\n{{context}}",
      ],
      [
        "文章配图",
        "realistic, wide aspect ratio：16:9，左下叫加水印haxitag.ai。请根据下面文章内容生成一张配图：\n\ncontext:{{context}}",
      ],
    ];

    const LOGO_URL =
      "https://raw.githubusercontent.com/zhyr/HaxiTAG-Assistant/main/icon/icon.png";

    function getTextArea() {
      const hostname = window.location.hostname;
      if (hostname === "chat.openai.com" || hostname === "chatgpt.com") {
        return safeQuerySelector("textarea");
      } else if (hostname === "claude.ai") {
        return safeQuerySelector('div[contenteditable="true"]');
      } else if (hostname === "kimi.moonshot.cn") {
        return safeQuerySelector(".editor___KShcc");
      } else if (hostname === "tongyi.aliyun.com") {
        return safeQuerySelector(".ant-input.textarea--g7EUvnQR");
      }
      return null;
    }

    function triggerInputEvent(textarea) {
      const inputEvent = new Event("input", {
        bubbles: true,
        cancelable: true,
      });
      const changeEvent = new Event("change", {
        bubbles: true,
        cancelable: true,
      });

      textarea.dispatchEvent(inputEvent);
      textarea.dispatchEvent(changeEvent);

      if (window.location.hostname === "tongyi.aliyun.com") {
        // 触发React的onChange事件
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          "value",
        ).set;
        nativeInputValueSetter.call(textarea, textarea.value);
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    const styles = `
      #haxitagAssistantOpen {
        position: fixed;
        top: 50%;
        right: 10px;
        color: white !important;
        z-index: 10000 !important;
        padding: 10px;
        cursor: pointer;
        border-radius: 5px;
      }
      #haxitagAssistantMain {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        width: 300px;
        background-color: rgba(51, 51, 51, 0.9) !important;
        color: white !important;
        z-index: 10001 !important;
        padding: 5px;
        transform: translateX(100%);
        transition: transform 0.2s;
      }
      #haxitagAssistantMain ul li {
        background-color: rgba(80, 80, 80, 0.6) !important;
        color: white !important;
        margin-bottom: 10px;
        padding: 5px;
        cursor: pointer;
        border-radius: 3px;
      }
      #haxitagAssistantMain ul li:hover {
        background-color: rgba(100, 100, 100, 0.8) !important;
      }
      #haxitagAssistantOpen {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      #haxitagAssistantOpen img {
        width: 40px;
        height: 40px;
        margin-bottom: 5px;
      }
      #haxitagAssistantMain .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
      }
      #haxitagAssistantMain .header img {
        width: 30px;
        height: 30px;
        margin-right: 5px;
      }
      .function-button {
        background-color: rgba(80, 80, 80, 0.6) !important;
        color: white !important;
        margin-right: 5px;
        padding: 5px 5px;
        cursor: pointer;
        border-radius: 3px;
        border: none;
      }
      .function-button:hover {
        background-color: rgba(100, 100, 100, 0.8) !important;
      }
      #searchInput {
        width: 100%;
        margin-bottom: 10px;
        padding: 5px;
        background-color: rgba(80, 80, 80, 0.6) !important;
        color: white !important;
        border: none;
        border-radius: 3px;
      }
      .add-prompt-form {
        display: none;
        margin-top: 10px;
      }
      .add-prompt-form input {
        width: 100%;
        margin-bottom: 10px;
        padding: 5px;
        background-color: rgba(80, 80, 80, 0.6) !important;
        color: white !important;
        border: none;
        border-radius: 3px;
      }
      .add-prompt-form button {
        margin-right: 10px;
        padding: 5px 10px;
        cursor: pointer;
        border-radius: 3px;
        border: none;
        background-color: rgba(80, 80, 80, 0.6) !important;
        color: white !important;
      }
      .delete-button {
        display: none;
        margin-left: 10px;
        padding: 2px 5px;
        cursor: pointer;
        border-radius: 3px;
        border: none;
        background-color: rgba(255, 0, 0, 0.6) !important;
        color: white !important;
      }
    `;

    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    var rootEle = document.createElement("div");

    rootEle.id = "haxitagAssistant";
    const isClaudeAI = window.location.hostname === "claude.ai";

    rootEle.innerHTML = `
      <div id="haxitagAssistantOpen">
        ${isClaudeAI ? "<span>HaxiTAG Assistant</span>" : `<img src="${LOGO_URL}" alt="HaxiTAG Logo">`}
      </div>
      <div id="haxitagAssistantMain">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px;">
          <h2>HaxiTAG Assistant</h2>
          <button id="haxitagAssistantClose" style="background: none; border: none; color: white; cursor: pointer;">关闭</button>
        </div>
        <div>
          <button id="searchButton" class="function-button">Search</button>
          <button id="addButton" class="function-button">Add</button>
          <button id="editButton" class="function-button">Edit</button>
          <button id="contextButton" class="function-button">Context</button>
        </div>
        <input type="text" id="searchInput" placeholder="Search prompts..." style="display: none;">
        <div class="add-prompt-form">
          <input type="text" id="promptName" placeholder="Prompt name">
          <input type="text" id="promptDetail" placeholder="Prompt detail">
          <button id="cancelAdd">Cancel</button>
          <button id="confirmAdd">Add</button>
        </div>
        <ul style="list-style-type: none; padding: 0;">
          ${SHORTCUTS.map(
            ([label, value]) => `
            <li data-value="${encodeURI(value)}">
              ${label}
              <button class="delete-button">Delete</button>
            </li>
          `,
          ).join("")}
        </ul>
      </div>
    `;

    document.body.appendChild(rootEle);

    // 为 Claude.ai 添加特定的样式
    if (isClaudeAI) {
      const claudeStyles = `
        #haxitagAssistantOpen span {
          text-align: center;
          font-size: 16px;
          line-height: 1.2;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 5px;
          background-color: rgba(51, 51, 51, 0.4);
          color: white;
          width: 90px;
          height: 70px;
        }
      `;
      const claudeStyleElement = document.createElement("style");
      claudeStyleElement.textContent = claudeStyles;
      document.head.appendChild(claudeStyleElement);
    }

    document.body.appendChild(rootEle);

    var haxitagAssistantMain = document.querySelector("#haxitagAssistantMain");
    var haxitagAssistantOpen = document.querySelector("#haxitagAssistantOpen");
    var haxitagAssistantClose = document.querySelector(
      "#haxitagAssistantClose",
    );
    var searchButton = document.querySelector("#searchButton");
    var addButton = document.querySelector("#addButton");
    var editButton = document.querySelector("#editButton");
    var searchInput = document.querySelector("#searchInput");
    var addPromptForm = document.querySelector(".add-prompt-form");
    var cancelAddButton = document.querySelector("#cancelAdd");
    var confirmAddButton = document.querySelector("#confirmAdd");
    var promptList = document.querySelector("#haxitagAssistantMain ul");

    var isOpen = false;
    var isSearchMode = false;
    var isAddMode = false;
    var isEditMode = false;

    function toggleHelper() {
      if (!isOpen) {
        haxitagAssistantMain.style.transform = "translateX(0)";
        haxitagAssistantOpen.style.opacity = "0.5";
        isOpen = true;
      } else {
        haxitagAssistantMain.style.transform = "translateX(100%)";
        haxitagAssistantOpen.style.opacity = "1";
        isOpen = false;
        resetAllModes();
      }
    }

    function resetAllModes() {
      isSearchMode = false;
      isAddMode = false;
      isEditMode = false;
      searchInput.style.display = "none";
      addPromptForm.style.display = "none";
      document
        .querySelectorAll(".delete-button")
        .forEach((btn) => (btn.style.display = "none"));
    }

    searchButton.addEventListener("click", function () {
      if (!isSearchMode) {
        resetAllModes();
        isSearchMode = true;
        searchInput.style.display = "block";
        searchInput.focus();
      } else {
        resetAllModes();
      }
    });

    addButton.addEventListener("click", function () {
      if (!isAddMode) {
        resetAllModes();
        isAddMode = true;
        addPromptForm.style.display = "block";
      } else {
        resetAllModes();
      }
    });

    editButton.addEventListener("click", function () {
      if (!isEditMode) {
        resetAllModes();
        isEditMode = true;
        document
          .querySelectorAll(".delete-button")
          .forEach((btn) => (btn.style.display = "inline"));
      } else {
        resetAllModes();
      }
    });

    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase();
      document.querySelectorAll("#haxitagAssistantMain ul li").forEach((li) => {
        const promptName = li.textContent.toLowerCase();
        if (promptName.includes(searchTerm)) {
          li.style.display = "block";
        } else {
          li.style.display = "none";
        }
      });
    });

    cancelAddButton.addEventListener("click", function () {
      resetAllModes();
    });

    confirmAddButton.addEventListener("click", function () {
      const promptName = document.querySelector("#promptName").value;
      const promptDetail = document.querySelector("#promptDetail").value;
      if (promptName && promptDetail) {
        const newLi = document.createElement("li");
        newLi.setAttribute("data-value", encodeURI(promptDetail));
        newLi.innerHTML = `
          ${promptName}
          <button class="delete-button">Delete</button>
        `;
        promptList.appendChild(newLi);
        document.querySelector("#promptName").value = "";
        document.querySelector("#promptDetail").value = "";
        resetAllModes();
        showToast("Prompt added successfully!");
      }
    });

    promptList.addEventListener("click", function (event) {
      if (event.target.classList.contains("delete-button")) {
        event.target.closest("li").remove();
        showToast("Prompt deleted successfully!");
      } else if (event.target.nodeName === "LI" && !isEditMode) {
        var value = event.target.getAttribute("data-value");
        if (value) {
          const decodedValue = decodeURI(value);
          const hostname = window.location.hostname;

          if (
            hostname === "kimi.moonshot.cn" ||
            hostname === "tongyi.aliyun.com"
          ) {
            // Copy to clipboard for Kimi and Tongyi
            navigator.clipboard.writeText(decodedValue).then(
              function () {
                showToast("Prompt copied to clipboard!");
              },
              function (err) {
                console.error("Could not copy text: ", err);
                showToast("Failed to copy prompt. Please try again.");
              },
            );
          } else {
            // For other platforms, keep the existing behavior
            var textareaEle = getTextArea();
            if (textareaEle) {
              if (textareaEle.classList.contains("editor___KShcc")) {
                textareaEle.textContent = decodedValue;
              } else if (hostname === "claude.ai") {
                textareaEle.textContent = decodedValue;
              } else {
                textareaEle.value = decodedValue;
              }

              textareaEle.style.height = "auto";
              textareaEle.style.height = textareaEle.scrollHeight + "px";

              triggerInputEvent(textareaEle);

              setTimeout(function () {
                textareaEle.focus();
              }, 100);
            }
          }
        }
        toggleHelper();
      }
    });

    var contextButton = document.querySelector("#contextButton");

    if (contextButton) {
      contextButton.addEventListener("click", function () {
        chrome.runtime.sendMessage(
          "olajillbhagclbnjlpphgebfnodbdocm",
          { action: "openPopup" },
          function (response) {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError);
            } else if (!response || !response.success) {
              console.error("Failed to open Yueli Socang Local popup.");
            }
          },
        );
      });
    } else {
      console.error("Context button not found.");
    }

    function showToast(message) {
      const toast = document.createElement("div");
      toast.textContent = message;
      toast.style.position = "fixed";
      toast.style.bottom = "20px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%)";
      toast.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      toast.style.color = "white";
      toast.style.padding = "10px 10px";
      toast.style.borderRadius = "5px";
      toast.style.zIndex = "10002";
      document.body.appendChild(toast);
      setTimeout(() => {
        toast.remove();
      }, 1500);
    }

    haxitagAssistantOpen.addEventListener("click", toggleHelper);
    haxitagAssistantClose.addEventListener("click", toggleHelper);

    document.addEventListener("keydown", function (event) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.code === "KeyF"
      ) {
        event.preventDefault();
        toggleHelper();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.code === "Escape" && isOpen) {
        toggleHelper();
      }
    });

    document.addEventListener("click", function (event) {
      if (
        isOpen &&
        !event.target.closest("#haxitagAssistantMain") &&
        !event.target.closest("#haxitagAssistantOpen")
      ) {
        toggleHelper();
      }
    });

    console.log("HaxiTAG Assistant has been loaded!");
  });
})();
