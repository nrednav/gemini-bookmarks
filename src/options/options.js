import { getAllStorageData } from "../helpers/get-all-storage-data";

const CONVERSATION_KEY_PREFIX = "gb-conversation-";

const listElement = document.getElementById("conversations-list");
const loadingElement = document.getElementById("loading-state");
const emptyElement = document.getElementById("empty-state");
const totalUsageBadge = document.getElementById("total-usage-badge");

let totalStorageBytes = 0;

/**
 * Formats a number of bytes into a human-readable string (KB, MB).
 * @param {number} bytes - The number of bytes.
 * @returns {string}
 */
function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const formattedSize = parseFloat((bytes / k ** i).toFixed(2));

  return `${formattedSize} ${sizes[i]}`;
}

/**
 * Updates the total usage badge in the header.
 */
function updateTotalUsageDisplay() {
  if (totalStorageBytes > 0) {
    totalUsageBadge.textContent = `Total Usage: ${formatBytes(totalStorageBytes)}`;
    totalUsageBadge.style.display = "inline-block";
  } else {
    totalUsageBadge.style.display = "none";
  }
}

/**
 * Fetches all conversation data and renders it to the page.
 */
async function loadAndRenderConversations() {
  try {
    const allData = await getAllStorageData();

    totalStorageBytes = 0;

    const conversations = Object.keys(allData)
      .filter((key) => key.startsWith(CONVERSATION_KEY_PREFIX))
      .map((key) => {
        const data = allData[key];
        const sizeInBytes = new Blob([JSON.stringify(data)]).size;

        totalStorageBytes += sizeInBytes;

        return { key, data, sizeInBytes };
      });

    loadingElement.style.display = "none";

    updateTotalUsageDisplay();

    if (conversations.length === 0) {
      emptyElement.style.display = "block";
      return;
    }

    // Sort by the most recently bookmarked conversation first
    conversations.sort((a, b) => {
      const lastBookmarkA = Math.max(
        ...a.data.bookmarks.map((bookmark) => bookmark.timestamp),
      );
      const lastBookmarkB = Math.max(
        ...b.data.bookmarks.map((bookmark) => bookmark.timestamp),
      );

      return lastBookmarkB - lastBookmarkA;
    });

    for (const conversation of conversations) {
      const listItem = createConversationListItem(
        conversation.key,
        conversation.data,
        conversation.sizeInBytes,
      );

      listElement.appendChild(listItem);
    }
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
function createConversationListItem(key, data, sizeInBytes) {
  const listItem = document.createElement("li");

  listItem.className = "conversation-item";
  listItem.dataset.storageKey = key;
  listItem.dataset.sizeInBytes = sizeInBytes;

  const urlPath = key.replace(CONVERSATION_KEY_PREFIX, "");
  const bookmarkCount = data.bookmarks.length;
  const lastUpdated = new Date(
    Math.max(...data.bookmarks.map((b) => b.timestamp)),
  ).toLocaleString();

  listItem.innerHTML = `
    <div class="conversation-info">
      <div class="url-path">${urlPath}</div>
      <div class="bookmark-count">
        ${bookmarkCount} bookmark(s) – Last updated: ${lastUpdated}
        <span class="usage-badge">${formatBytes(sizeInBytes)}</span>
      </div>
    </div>
    <div class="conversation-actions">
      <button class="view-button">${chrome.i18n.getMessage("optionsViewButton")}</button>
      <button class="delete-button">${chrome.i18n.getMessage("optionsDeleteButton")}</button>
    </div>
  `;

  listItem.querySelector(".view-button").addEventListener("click", handleView);
  listItem
    .querySelector(".delete-button")
    .addEventListener("click", handleDelete);

  return listItem;
}

/**
 * Handles the click event for a view button.
 * @param {MouseEvent} event
 */
function handleView(event) {
  const listItem = event.target.closest(".conversation-item");
  const key = listItem.dataset.storageKey;
  const urlPath = key.replace(CONVERSATION_KEY_PREFIX, "");
  const fullUrl = `https://gemini.google.com${urlPath}`;

  chrome.tabs.create({ url: fullUrl });
}

/**
 * Handles the click event for a delete button.
 * @param {MouseEvent} event
 */
async function handleDelete(event) {
  const listItem = event.target.closest(".conversation-item");
  const key = listItem.dataset.storageKey;
  const sizeInBytes = parseInt(listItem.dataset.sizeInBytes, 10);

  const confirmationMessage = chrome.i18n.getMessage(
    "optionsDeleteConfirmation",
  );

  if (window.confirm(confirmationMessage)) {
    try {
      await chrome.storage.local.remove(key);

      listItem.remove();

      totalStorageBytes -= sizeInBytes;

      updateTotalUsageDisplay();

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
