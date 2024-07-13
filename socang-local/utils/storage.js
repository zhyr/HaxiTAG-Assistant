export function saveData(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ socangData: data }, function() {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

export function getData() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["socangData"], function(result) {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result.socangData || []);
    });
  });
}