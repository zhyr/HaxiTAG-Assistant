document.addEventListener("DOMContentLoaded", function () {
  var toggleSwitch = document.getElementById("extensionToggle");
  var languageSelect = document.getElementById("languageSelect");

  // 从存储中获取扩展状态和语言设置
  chrome.storage.sync.get(["extensionEnabled", "language"], function (data) {
    toggleSwitch.checked = data.extensionEnabled !== false;
    languageSelect.value = data.language || 'zh';
  });

  // 监听开关变化
  toggleSwitch.addEventListener("change", function () {
    var isEnabled = this.checked;
    chrome.storage.sync.set({ extensionEnabled: isEnabled }, function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "toggleExtension",
          enabled: isEnabled,
        });
      });
    });
  });

  // 监听语言选择变化
  languageSelect.addEventListener("change", function () {
    var selectedLanguage = this.value;
    chrome.storage.sync.set({ language: selectedLanguage }, function () {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "changeLanguage",
          language: selectedLanguage,
        });
      });
    });
  });
});