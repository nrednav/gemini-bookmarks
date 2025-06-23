chrome.runtime.onMessage.addListener((message) => {
  switch (message.action) {
    case "openOptionsPage":
      chrome.runtime.openOptionsPage();
      break;
    default:
      break;
  }
});
