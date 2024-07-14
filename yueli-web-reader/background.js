// background.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.storage.sync.get(["autoDomains", "apiKey"], (result) => {
      const autoDomains = result.autoDomains || [];
      const apiKey = result.apiKey || "";
      if (autoDomains.some((domain) => tab.url.includes(domain))) {
        const jinaUrl = `https://r.jina.ai/${encodeURIComponent(tab.url)}`;
        fetch(jinaUrl, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        })
          .then((response) => response.text())
          .then((content) => {
            const blob = new Blob([content], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            chrome.tabs.update(tabId, { url: url });
          })
          .catch((error) => console.error("Error:", error));
      }
    });
  }
});
