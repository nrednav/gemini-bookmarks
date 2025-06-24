export class Logger {
  constructor(window) {
    const { version } = chrome.runtime.getManifest();

    this.prefix = `Gemini Bookmarks (v${version}):`;
    this.debug = this.createDebugMethod(window);
  }

  createDebugMethod(window) {
    try {
      const url = new URL(window.location.href);

      if (url.searchParams.get("gb-debug") === true) {
        return this.logWithPrefix(console.debug);
      }
    } catch (error) {
      console.error(`${this.prefix} Failed to check for debug mode:`, error);
    }

    return () => {};
  }

  logWithPrefix(logMethod) {
    return (...args) => logMethod(this.prefix, ...args);
  }

  info = this.logWithPrefix(console.info);
  warn = this.logWithPrefix(console.warn);
  error = this.logWithPrefix(console.error);
}
