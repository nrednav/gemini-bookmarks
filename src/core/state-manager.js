export class StateManager {
  constructor({ conversationKey }) {
    this.conversationKey = conversationKey;
    this.state = this.getInitialState();
  }

  getState() {
    return structuredClone(this.state);
  }

  setState(state) {
    this.state = state;
  }

  resetState() {
    this.state = this.getInitialState();
  }

  getInitialState() {
    return { bookmarks: [], activeTagFilters: [] };
  }

  async loadStateFromStorage() {
    const storedState = await browser.storage.local.get(this.conversationKey);

    this.state = storedState[this.conversationKey] || this.getInitialState();
  }

  async saveStateToStorage() {
    await browser.storage.local.set({ [this.conversationKey]: this.state });
  }
}
