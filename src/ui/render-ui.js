import { toggleTagsExpansion } from "../core/actions";
import { filterBookmarksByTags, getUniqueTags } from "../core/logic";
import { createIconElement } from "../helpers/create-icon-element.js";
import { actionIcons } from "./icons.js";

/**
 * Renders the entire UI based on the current state.
 * @param {import('../core/types.js').Dependencies} dependencies
 */
export const renderUi = (dependencies) => {
  const { uiElements, stateManager, elementSelectors, window } = dependencies;

  const currentState = stateManager.getState();

  if (uiElements.clearAllButton) {
    uiElements.clearAllButton.disabled = currentState.bookmarks.length === 0;
  }

  renderPanelContent({ currentState, uiElements, window, stateManager });
  updateAllBookmarkButtonUis({ uiElements, elementSelectors, currentState });
};

/**
 * Decides which tags to show based on the expansion state.
 * @param {string[]} allTags - All unique tags sorted alphabetically.
 * @param {string[]} activeFilters - The currently active tags.
 * @param {boolean} isExpanded - Whether the panel is expanded.
 * @param {number} limit - The number of tags to show when collapsed.
 */
const getTagsToRender = (allTags, activeFilters, isExpanded, limit) => {
  // If expanded, show everything, purely alphabetical.
  if (isExpanded) {
    return allTags;
  }

  // If collapsed, place active tags into the view.
  const activeTags = allTags.filter((tag) => activeFilters.includes(tag));
  const inactiveTags = allTags.filter((tag) => !activeFilters.includes(tag));
  const combined = [...activeTags, ...inactiveTags].slice(0, limit);

  return combined.sort((a, b) => a.localeCompare(b));
};

/**
 * Renders the content of the bookmarks panel (tags and bookmarks list).
 * @param {object} dependencies - The dependencies for this specific render function.
 * @param {import('../core/types.js').AppState} dependencies.currentState
 * @param {import('../core/types.js').UIElements} dependencies.uiElements
 * @param {Window} dependencies.window
 */
const renderPanelContent = (dependencies) => {
  const { currentState, uiElements, window } = dependencies;
  const { activeTagFilters, isTagsExpanded } = currentState;

  const previousScrollTop = uiElements.tagsContainer.scrollTop;

  if (isTagsExpanded) {
    uiElements.tagsContainer.classList.add("expanded");
  } else {
    uiElements.tagsContainer.classList.remove("expanded");
  }

  const uniqueTags = getUniqueTags(currentState);
  const TAG_LIMIT = 10;
  const tagsToRender = getTagsToRender(
    uniqueTags,
    activeTagFilters,
    isTagsExpanded,
    TAG_LIMIT,
  );

  const showTagsToggleButton = uniqueTags.length > TAG_LIMIT;

  uiElements.tagsContainer.replaceChildren();

  tagsToRender.forEach((tag) => {
    const tagButton = window.document.createElement("button");

    tagButton.className = "gb-panel-tag-filter";
    tagButton.textContent = tag;
    tagButton.dataset.tag = tag;

    if (currentState.activeTagFilters.includes(tag)) {
      tagButton.classList.add("active");
    }

    tagButton.addEventListener("mousedown", (e) => e.preventDefault());

    uiElements.tagsContainer.appendChild(tagButton);
  });

  if (showTagsToggleButton) {
    const tagsToggleButton = window.document.createElement("button");

    tagsToggleButton.className = "gb-tags-toggle-button";

    if (isTagsExpanded) {
      tagsToggleButton.textContent = "Show Less";
      tagsToggleButton.append(createIconElement(actionIcons.close));
    } else {
      const remainingCount = uniqueTags.length - tagsToRender.length;

      const totalActive = activeTagFilters.length;
      const visibleActive = tagsToRender.filter((t) =>
        activeTagFilters.includes(t),
      ).length;
      const hiddenActiveCount = totalActive - visibleActive;

      if (hiddenActiveCount > 0) {
        tagsToggleButton.textContent = `+${remainingCount} more (${hiddenActiveCount} active)`;
        tagsToggleButton.style.fontWeight = "700";
        tagsToggleButton.style.color = "var(--color-brand-primary)";
      } else {
        tagsToggleButton.textContent = `+${remainingCount} more`;
      }
    }

    tagsToggleButton.addEventListener("click", () => {
      toggleTagsExpansion(dependencies);
    });

    uiElements.tagsContainer.appendChild(tagsToggleButton);
  }

  uiElements.tagsContainer.scrollTop = previousScrollTop;

  // Render bookmarks
  const bookmarksToShow =
    currentState.activeTagFilters.length > 0
      ? filterBookmarksByTags(currentState, currentState.activeTagFilters)
      : currentState.bookmarks;

  uiElements.bookmarksContainer.replaceChildren();

  if (currentState.bookmarks.length === 0) {
    const emptyMessage = window.document.createElement("p");

    emptyMessage.className = "gb-panel__empty-message";
    emptyMessage.textContent = chrome.i18n.getMessage("panelEmptyMessage");

    uiElements.bookmarksContainer.appendChild(emptyMessage);

    return;
  }

  const sortedBookmarks = bookmarksToShow.sort((a, b) => a.index - b.index);

  sortedBookmarks.forEach((bookmark) => {
    const bookmarkElement = window.document.createElement("div");

    bookmarkElement.className = "gb-panel-bookmark";
    bookmarkElement.dataset.bookmarkId = bookmark.id;
    bookmarkElement.title = chrome.i18n.getMessage("scrollToBookmarkTitle");

    const contentElement = window.document.createElement("p");

    contentElement.className = "gb-panel-bookmark__content";
    contentElement.textContent = `${bookmark.content.substring(0, 120)}...`;

    const tagsContainer = window.document.createElement("div");

    tagsContainer.className = "gb-panel-bookmark__tags";

    bookmark.tags.forEach((tag) => {
      const tagElement = window.document.createElement("span");

      tagElement.className = "gb-panel-bookmark__tag";
      tagElement.textContent = tag;

      tagsContainer.appendChild(tagElement);
    });

    const actionsContainer = window.document.createElement("div");

    actionsContainer.className = "gb-panel-bookmark__actions";

    const copyButton = window.document.createElement("button");

    copyButton.className =
      "gb-panel-bookmark__action-button gb-panel-bookmark__copy-button";
    copyButton.title = chrome.i18n.getMessage("copyButtonTooltip");
    copyButton.append(createIconElement(actionIcons.copy));

    const viewButton = window.document.createElement("button");

    viewButton.className =
      "gb-panel-bookmark__action-button gb-panel-bookmark__view-button";
    viewButton.title = chrome.i18n.getMessage("viewButtonTooltip");
    viewButton.append(createIconElement(actionIcons.view));

    const deleteButton = window.document.createElement("button");

    deleteButton.className =
      "gb-panel-bookmark__action-button gb-panel-bookmark__delete-button";
    deleteButton.title = chrome.i18n.getMessage("deleteButtonTooltip");
    deleteButton.append(createIconElement(actionIcons.delete));

    actionsContainer.appendChild(viewButton);
    actionsContainer.appendChild(copyButton);
    actionsContainer.appendChild(deleteButton);
    bookmarkElement.appendChild(contentElement);
    bookmarkElement.appendChild(tagsContainer);
    bookmarkElement.appendChild(actionsContainer);
    uiElements.bookmarksContainer.appendChild(bookmarkElement);
  });
};

/**
 * Updates the visual state of all bookmark buttons on the page.
 * @param {object} dependencies - The dependencies for this specific update function.
 * @param {import('../core/types.js').UIElements} dependencies.uiElements
 * @param {import('../data/element-selectors.js').ElementSelectors} dependencies.elementSelectors
 * @param {import('../core/types.js').AppState} dependencies.currentState
 */
const updateAllBookmarkButtonUis = (dependencies) => {
  const { uiElements, elementSelectors, currentState } = dependencies;

  for (const bookmarkButton of uiElements.bookmarkButtons) {
    const responseElement = bookmarkButton.closest(
      elementSelectors.modelResponse.container,
    );

    if (responseElement) {
      updateBookmarkButtonUi(bookmarkButton, responseElement.id, currentState);
    }
  }
};

/**
 * Updates the visual state of a single bookmark button.
 * @param {HTMLButtonElement} bookmarkButton
 * @param {string} id
 * @param {import('../core/types.js').AppState} currentState
 */
export const updateBookmarkButtonUi = (bookmarkButton, id, currentState) => {
  const isBookmarked = currentState.bookmarks.some(
    (bookmark) => bookmark.id === id,
  );

  if (isBookmarked) {
    bookmarkButton.classList.add("active");
    bookmarkButton.title = chrome.i18n.getMessage("removeBookmarkTooltip");
  } else {
    bookmarkButton.classList.remove("active");
    bookmarkButton.title = chrome.i18n.getMessage("addBookmarkTooltip");
  }
};
