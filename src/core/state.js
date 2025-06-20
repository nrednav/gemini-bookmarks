var GeminiBookmarks = {};

/**
 * The initial, empty state of the application.
 *
 * @typedef {object} Bookmark
 * @property {string} id - A unique identifier for the bookmark
 * @property {string} content - The text or HTML content of the bookmarked response.
 * @property {string[]} tags - An array of user-defined tags.
 * @property {number} timestamp - The UTC timestamp when the bookmark was created.
 *
 * @typedef {object} AppState
 * @property {Bookmark[]} bookmarks - An array of all bookmark objects for the current conversation.
 */

/**
 * @type {AppState}
 */
GeminiBookmarks.initialState = {
  bookmarks: []
};
