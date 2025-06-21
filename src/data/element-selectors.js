/**
 * @typedef {object} ElementSelectors
 * @property {object} modelResponse
 * @property {string} modelResponse.container
 * @property {string} modelResponse.messageContent
 * @property {object} ui
 * @property {string} ui.fab
 * @property {string} ui.panel
 * @property {string} ui.panelBookmark
 * @property {string} ui.panelFilterTag
 * @property {string} ui.tagsContainer
 * @property {string} ui.bookmarksContainer
 * @property {string} ui.clearAllButton
 * @property {string} ui.bookmarkButton
 */

/** @type {ElementSelectors} */
export const elementSelectors = {
  modelResponse: {
    container: "model-response",
    messageContent: "message-content"
  },
  ui: {
    fab: ".gb-fab",
    panel: ".gb-panel",
    panelBookmark: ".gb-panel-bookmark",
    panelTagFilter: ".gb-panel-tag-filter",
    tagsContainer: "gb-tags-container",
    bookmarksContainer: "gb-bookmarks-container",
    clearAllButton: ".gb-clear-all-button",
    bookmarkButton: ".bookmark-button"
  }
}
