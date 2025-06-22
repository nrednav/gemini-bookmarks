import {
  clearAllBookmarks,
  cycleTheme,
  toggleTagFilter,
} from "../core/actions";
import { getScrollContainer } from "../helpers/get-scroll-container.js";
import { smoothScrollUp } from "../helpers/smooth-scroll-up.js";
import { waitForElement } from "../helpers/wait-for-element.js";
import { createContentModal } from "../ui/modal.js";
import { showToast } from "../ui/toast.js";

const HIGHLIGHT_DURATION_MS = 1500;

/**
 * Sets up all the global event listeners for the application.
 * @param {import('../core/types.js').Dependencies} dependencies
 */
export const setupEventListeners = (dependencies) => {
  const { uiElements, elementSelectors } = dependencies;

  if (uiElements.fab && uiElements.panel) {
    uiElements.fab.addEventListener("click", () => {
      uiElements.panel.classList.toggle("visible");
    });
  }

  if (uiElements.bookmarksContainer) {
    uiElements.bookmarksContainer.addEventListener("click", (e) => {
      handleBookmarkContainerClick(e, dependencies);
    });
  }

  if (uiElements.tagsContainer) {
    uiElements.tagsContainer.addEventListener("click", (e) => {
      const clickedTag = e.target.closest(elementSelectors.ui.panelTagFilter);

      if (!clickedTag) {
        return;
      }

      const tag = clickedTag.dataset.tag;

      toggleTagFilter(dependencies, tag);
    });
  }

  if (uiElements.clearAllButton) {
    uiElements.clearAllButton.addEventListener("click", async () => {
      await clearAllBookmarks(dependencies);
    });
  }

  if (uiElements.themeToggleButton) {
    uiElements.themeToggleButton.addEventListener("click", async () => {
      await cycleTheme(dependencies);
    });
  }
};

/**
 * Handles all click events within the bookmarks container, delegating to the correct action.
 * @param {MouseEvent} e The click event.
 * @param {import('../core/types.js').Dependencies} dependencies
 */
const handleBookmarkContainerClick = (e, dependencies) => {
  const { window, elementSelectors, stateManager } = dependencies;

  const bookmarkElement = e.target.closest(elementSelectors.ui.panelBookmark);

  if (!bookmarkElement) {
    return;
  }

  const bookmarkId = bookmarkElement.dataset.bookmarkId;

  if (!bookmarkId) {
    return;
  }

  const currentState = stateManager.getState();
  const bookmark = currentState.bookmarks.find(
    (bookmark) => bookmark.id === bookmarkId,
  );

  if (!bookmark) {
    console.error(`Could not find bookmark data for ID: ${bookmarkId}`);
    return;
  }

  const viewButton = e.target.closest(elementSelectors.ui.viewBookmarkButton);

  if (viewButton) {
    e.stopPropagation();
    createContentModal(
      chrome.i18n.getMessage("viewModalTitle"),
      bookmark.content,
    );
    return;
  }

  const copyButton = e.target.closest(elementSelectors.ui.copyBookmarkButton);

  if (copyButton) {
    e.stopPropagation();

    navigator.clipboard
      .writeText(bookmark.content)
      .then(() => {
        showToast(chrome.i18n.getMessage("copySuccessToast"), "success");
      })
      .catch((error) => {
        console.error("Failed to copy text: ", error);
      });

    return;
  }

  const responseElement = window.document.getElementById(bookmarkId);

  if (responseElement) {
    highlightAndScroll(responseElement);
  } else {
    const scrollContainer = getScrollContainer(
      elementSelectors.modelResponse.container,
    );
    const scrollAnimation = smoothScrollUp(scrollContainer);

    waitForElement({
      selector: bookmarkId,
      searchMethod: "getElementById",
      timeout: 30000,
      rejectOnTimeout: false,
    }).then((foundElement) => {
      scrollAnimation.cancel();

      if (foundElement) {
        highlightAndScroll(foundElement);
      } else {
        console.error("Failed to find bookmark to scroll to.");
      }
    });
  }
};

/**
 * Scrolls to an element and applies a temporary highlight.
 * @param {HTMLElement} element The element to scroll to and highlight.
 */
const highlightAndScroll = (element) => {
  element.scrollIntoView({ behavior: "smooth", block: "start" });
  element.classList.add("bookmark-highlight");

  setTimeout(() => {
    element.classList.remove("bookmark-highlight");
  }, HIGHLIGHT_DURATION_MS);
};
