export const elementSelectors = {
  modelResponse: {
    container: "model-response",
    messageContent: "message-content"
  },
  observerTarget: (window) => window.document.body.querySelector("main") || window.document.body,
  ui: {
    fab: ".gb-fab",
    panel: ".gb-panel",
    panelBookmark: ".gb-panel-bookmark",
    panelFilterTag: ".gb-panel-filter-tag",
    tagsContainer: "gb-tags-container",
    bookmarksContainer: "gb-bookmarks-container",
    clearAllButton: ".gb-clear-all-button",
    bookmarkButton: ".bookmark-button"
  }
}
