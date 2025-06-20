browser.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.url && details.url.includes("gemini.google.com/")) {
    browser.tabs.sendMessage(details.tabId, { type: "NAVIGATION" });
  }
});
