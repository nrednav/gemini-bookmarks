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

/**
 * A collection of key UI elements from the DOM.
 * @typedef {object} UIElements
 * @property {HTMLElement} fab - The floating action button.
 * @property {HTMLElement} panel - The main bookmarks panel.
 * @property {HTMLElement} tagsContainer - The container for filter tags.
 * @property {HTMLElement} bookmarksContainer - The container for bookmarks in the panel.
 * @property {HTMLButtonElement} clearAllButton - The 'Clear All' button.
 * @property {HTMLButtonElement} themeToggleButton - The button to toggle the UI theme.
 * @property {HTMLButtonElement[]} bookmarkButtons - A mutable array of all injected bookmark buttons.
 * @property {NodeListOf<Element>} modelResponses - A list of the response containers from the page.
 */

/**
 * A container for all shared application dependencies.
 * @typedef {object} Dependencies
 * @property {Window} window - The content window object.
 * @property {UIElements} uiElements - A collection of key UI elements.
 * @property {import('../data/element-selectors.js').ElementSelectors} elementSelectors - The DOM selectors.
 * @property {import('./state-manager.js').StateManager} stateManager - The state manager instance.
 * @property {() => Promise<void>} onNavigate - The callback function to re-initialize the script on navigation.
 * @property {import('../shell/logger.js').Logger} logger - The application logger instance.
 */

/**
 * Defines the possible theme values for the UI.
 * 'system' means the theme will follow the OS preference.
 * @typedef {'light' | 'dark' | 'system'} Theme
 */
