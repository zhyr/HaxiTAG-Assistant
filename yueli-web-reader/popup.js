// popup.js
document.getElementById("openWithJina").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url;
    chrome.storage.sync.get(["apiKey"], (result) => {
      const apiKey = result.apiKey || "";
      const jinaUrl = `https://r.jina.ai/${encodeURIComponent(currentUrl)}`;
      fetch(jinaUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      })
        .then((response) => response.text())
        .then((content) => {
          const blob = new Blob([content], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          chrome.tabs.create({ url: url });
        })
        .catch((error) => console.error("Error:", error));
    });
  });
});
