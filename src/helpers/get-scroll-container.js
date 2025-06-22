let cachedScrollContainer = null;

/**
 * Finds the main scrollable container for the Gemini responses and caches it.
 * It starts from the first visible response element to ensure it finds the
 * correct container, not a random scrollable element on the page.
 * @param {string} responseSelector - The CSS selector for a response element.
 * @returns {HTMLElement|Window} The main scrollable container.
 */
export const getScrollContainer = (responseSelector) => {
  if (cachedScrollContainer) {
    return cachedScrollContainer;
  }

  const startingElement = document.querySelector(responseSelector);

  if (!startingElement) {
    cachedScrollContainer = window;
    return window;
  }

  let parent = startingElement.parentElement;

  while (parent) {
    const style = window.getComputedStyle(parent);

    if (style.overflowY === "auto" || style.overflowY === "scroll") {
      cachedScrollContainer = parent;
      return parent;
    }

    parent = parent.parentElement;
  }

  cachedScrollContainer = window;

  return window;
};
