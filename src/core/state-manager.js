export class StateManager {
  /** @private @type {import('./types.js').AppState} */
  state;
  /** @private @type {string} */
  conversationKey;

  constructor({ conversationKey }) {
    this.conversationKey = conversationKey;
    this.state = this.getInitialState();
  }

  /**
   * Returns a deep copy of the current state.
   * @returns {import('./types.js').AppState}
   */
  getState() {
    return structuredClone(this.state);
  }

  /**
   * Overwrites the current state with a new state object.
   * @param {import('./types.js').AppState} state - The new state.
   */
  setState(state) {
    this.state = state;
  }

  /**
   * Resets the state to its initial empty value.
   */
  resetState() {
    this.state = this.getInitialState();
  }

  /**
   * Returns the default initial state.
   * @returns {import('./types.js').AppState}
   */
  getInitialState() {
    return { bookmarks: [], activeTagFilters: [] };
  }

  /**
   * Loads the conversation state from browser storage.
   * @returns {Promise<void>}
   */
  async loadStateFromStorage() {
    const storedState = await chrome.storage.local.get(this.conversationKey);

    this.state = storedState[this.conversationKey] || this.getInitialState();
  }

  /**
   * Saves the current conversation state to browser storage.
   * @returns {Promise<void>}
   */
  async saveStateToStorage() {
    await chrome.storage.local.set({ [this.conversationKey]: this.state });
  }
}
