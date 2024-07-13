chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action == "openPopup") {
    chrome.runtime.sendMessage(
      "olajillbhagclbnjlpphgebfnodbdocm",
      { action: "openPopup" },
      function (response) {
        sendResponse(response);
      },
    );
    return true; // 表示sendResponse将会被异步调用
  }
});
