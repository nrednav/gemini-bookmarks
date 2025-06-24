export class Logger {
  constructor(window) {
    const { version } = chrome.runtime.getManifest();

    this.prefix = `Gemini Bookmarks (v${version}):`;

    const isDebuggingEnabled = this.checkForDebugFlag(window);
    const noOp = () => {};
    const levels = ["debug", "info", "warn", "error"];

    for (const level of levels) {
      this[level] = isDebuggingEnabled
        ? this.logWithPrefix(console[level])
        : noOp;
    }
  }

  checkForDebugFlag(window) {
    try {
      const url = new URL(window.location.href);

      if (url.searchParams.get("gb-debug") === "true") {
        console.log(`${this.prefix} Debug mode is enabled.`);

        return true;
      }
    } catch (error) {
      console.error(`${this.prefix} Failed to check for debug mode:`, error);
    }

    return false;
  }

  logWithPrefix(logMethod) {
    return (...args) => logMethod(this.prefix, ...args);
  }
}
