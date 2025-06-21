/**
 * @typedef {object} Bookmark
 * @property {string} id - The unique identifier for the bookmark (a content hash).
 * @property {number} timestamp - The Unix timestamp when the bookmark was created.
 * @property {string} content - The text content of the bookmarked response.
 * @property {string[]} tags - A list of user-defined tags.
 */

/**
 * Defines the structure of the application's state object.
 * @typedef {object} AppState
 * @property {Bookmark[]} bookmarks - The list of all bookmarks for the conversation.
 * @property {string[]} activeTagFilters - A list of tags currently used for filtering.
 */
