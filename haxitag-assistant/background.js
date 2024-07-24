chrome.runtime.onInstalled.addListener(() => {
  // 初始化存储
  chrome.storage.sync.get(['instructions', 'contexts'], (result) => {
    if (!result.instructions) {
      chrome.storage.sync.set({ instructions: [] });
    }
    if (!result.contexts) {
      chrome.storage.sync.set({ contexts: [] });
    }
  });
});

// 在 Manifest V3 中，service worker 可能会被终止，所以需要处理重新激活的情况
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started');
  // 可以在这里添加任何需要在扩展启动时执行的代码
});