/**
 * A cross-browser compatible function to get all items from `chrome.storage.local`.
 *
 * This is necessary because:
 * - Chrome uses `chrome.storage.local.get(null, callback)`.
 * - Firefox uses `browser.storage.local.get()`, and its `chrome.*` compatibility
 *   layer for this specific call is unreliable (`get(null)` returns undefined).
 *
 * @returns {Promise<object>} A promise that resolves to an object containing all items in storage.
 */
export const getAllStorageData = () => {
  const isFirefox = chrome.runtime.getURL("").startsWith("moz-extension://");

  if (isFirefox) {
    return browser.storage.local.get();
  } else {
    return chrome.storage.local.get(null);
  }
};
