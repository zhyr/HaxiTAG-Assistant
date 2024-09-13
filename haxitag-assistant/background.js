chrome.runtime.onInstalled.addListener(() => {
  // 初始化存储
  chrome.storage.sync.get(['instructions', 'contexts', 'language'], (result) => {
    if (!result.instructions) {
      chrome.storage.sync.set({ instructions: [] });
    }
    if (!result.contexts) {
      chrome.storage.sync.set({ contexts: [] });
    }
    if (!result.language) {
      chrome.storage.sync.set({ language: 'zh' });
    }
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getStorageData") {
    chrome.storage.sync.get(['instructions', 'contexts', 'language'], (result) => {
      sendResponse(result);
    });
    return true;
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleExtension") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "toggleExtension", enabled: request.enabled});
    });
  }
});