// ==UserScript==
// @name          HaxiTAG Assistant Popup
// @version       1.0
// @description   HaxiTAG AI助手小工具弹出窗口脚本
// @author        Assistant
// @encoding      utf-8
// ==/UserScript==

document.addEventListener("DOMContentLoaded", function () {
  var toggleSwitch = document.getElementById("extensionToggle");

  // 从存储中获取扩展状态
  chrome.storage.sync.get("extensionEnabled", function (data) {
    toggleSwitch.checked = data.extensionEnabled !== false;
  });

  // 监听开关变化
  toggleSwitch.addEventListener("change", function () {
    var isEnabled = this.checked;
    // 保存扩展状态
    chrome.storage.sync.set({ extensionEnabled: isEnabled }, function () {
      // 向content script发送消息
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "toggleExtension",
          enabled: isEnabled,
        });
      });
    });
  });
});
