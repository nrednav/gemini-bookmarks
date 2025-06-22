/**
 * Waits for an element to be available in the DOM using a specified search method.
 *
 * @param {object} options
 * @param {string} options.selector - The CSS selector or ID to search for.
 * @param {HTMLElement} [options.parentElement=document] - The parent element to search within. Defaults to the document.
 * @param {number} [options.timeout=30000] - The maximum time to wait in milliseconds.
 * @param {boolean} [options.rejectOnTimeout=true] - If true, the promise rejects on timeout. If false, it resolves with null.
 * @param {'querySelector' | 'getElementById'} [options.searchMethod='querySelector'] - The search method to use.
 * @returns {Promise<HTMLElement|null>} A promise that resolves with the element, or null/rejects based on options.
 */
export const waitForElement = (options) => {
  const {
    selector,
    parentElement = document,
    timeout = 30000,
    rejectOnTimeout = true,
    searchMethod = "querySelector",
  } = options;

  return new Promise((resolve, reject) => {
    const findElement = () => {
      return searchMethod === "getElementById"
        ? document.getElementById(selector)
        : parentElement.querySelector(selector);
    };

    const element = findElement();

    if (element) {
      resolve(element);
      return;
    }

    const interval = setInterval(() => {
      const element = findElement();

      if (element) {
        clearInterval(interval);
        resolve(element);
        return;
      }
    }, 150);

    setTimeout(() => {
      clearInterval(interval);

      if (rejectOnTimeout) {
        reject(
          new Error(
            `Element with selector "${selector} not found within ${timeout} ms."`,
          ),
        );
      } else {
        resolve(null);
      }
    }, timeout);
  });
};
