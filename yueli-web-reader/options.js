// options.js
document.getElementById("save").addEventListener("click", () => {
  const apiKey = document.getElementById("apiKey").value;
  const domains = document
    .getElementById("domains")
    .value.split("\n")
    .filter((d) => d.trim());
  chrome.storage.sync.set(
    {
      apiKey: apiKey,
      autoDomains: domains,
    },
    () => {
      alert("Settings saved");
    },
  );
});

chrome.storage.sync.get(["apiKey", "autoDomains"], (result) => {
  document.getElementById("apiKey").value = result.apiKey || "";
  document.getElementById("domains").value = (result.autoDomains || []).join(
    "\n",
  );
});
