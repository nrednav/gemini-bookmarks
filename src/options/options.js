const CONVERSATION_KEY_PREFIX = "gb-conversation-";

const listElement = document.getElementById("conversations-list");
const loadingElement = document.getElementById("loading-state");
const emptyElement = document.getElementById("empty-state");

/**
 * Fetches all conversation data and renders it to the page.
 */
async function loadAndRenderConversations() {
  try {
    const allData = await chrome.storage.local.get(null);
    const conversationKeys = Object.keys(allData).filter((key) =>
      key.startsWith(CONVERSATION_KEY_PREFIX),
    );

    loadingElement.style.display = "none";

    if (conversationKeys.length === 0) {
      emptyElement.style.display = "block";
      return;
    }

    // Sort by the most recently bookmarked conversation first
    conversationKeys.sort((a, b) => {
      const lastBookmarkA = Math.max(
        ...allData[a].bookmarks.map((bookmark) => bookmark.timestamp),
      );
      const lastBookmarkB = Math.max(
        ...allData[b].bookmarks.map((bookmark) => bookmark.timestamp),
      );

      return lastBookmarkB - lastBookmarkA;
    });

    conversationKeys.forEach((key) => {
      const conversationData = allData[key];
      const listItem = createConversationListItem(key, conversationData);
      listElement.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error loading conversation data:", error);
    loadingElement.textContent = "Failed to load data. Please try again.";
  }
}

/**
 * Creates a single <li> element for a conversation.
 * @param {string} key - The storage key for the conversation.
 * @param {object} data - The data object for the conversation.
 * @returns {HTMLLIElement}
 */
function createConversationListItem(key, data) {
  const listItem = document.createElement("li");

  listItem.className = "conversation-item";
  listItem.dataset.storageKey = key;

  const urlPath = key.replace(CONVERSATION_KEY_PREFIX, "");
  const bookmarkCount = data.bookmarks.length;
  const lastUpdated = new Date(
    Math.max(...data.bookmarks.map((b) => b.timestamp)),
  ).toLocaleString();

  listItem.innerHTML = `
    <div class="conversation-info">
      <div class="url-path">${urlPath}</div>
      <div class="bookmark-count">${bookmarkCount} bookmark(s) – Last updated: ${lastUpdated}</div>
    </div>
    <button class="delete-button">${chrome.i18n.getMessage("optionsDeleteButton")}</button>
  `;

  const deleteButton = listItem.querySelector(".delete-button");

  deleteButton.addEventListener("click", handleDelete);

  return listItem;
}

/**
 * Handles the click event for a delete button.
 * @param {MouseEvent} event
 */
async function handleDelete(event) {
  const listItem = event.target.closest(".conversation-item");
  const key = listItem.dataset.storageKey;

  const confirmationMessage = chrome.i18n.getMessage(
    "optionsDeleteConfirmation",
  );

  if (window.confirm(confirmationMessage)) {
    try {
      await chrome.storage.local.remove(key);

      listItem.remove();

      if (listElement.children.length === 0) {
        emptyElement.style.display = "block";
      }
    } catch (error) {
      console.error(`Failed to delete data for key ${key}:`, error);
      alert("Error deleting conversation. Please try again.");
    }
  }
}

const localizeOptionsPage = () => {
  const localizedElements = document.querySelectorAll("[data-locale]");

  for (const localizedElement of localizedElements) {
    localizedElement.innerText = chrome.i18n.getMessage(
      localizedElement.dataset.locale,
    );
  }
};

const main = () => {
  localizeOptionsPage();
  loadAndRenderConversations();
};

document.addEventListener("DOMContentLoaded", main);
