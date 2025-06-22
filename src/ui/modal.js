/**
 * Creates and displays a non-blocking, promise-based confirmation modal.
 * @param {string} message - The confirmation message to display to the user.
 * @returns {Promise<boolean>} A promise that resolves to `true` if confirmed, `false` otherwise.
 */
export const createConfirmationModal = (message) => {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');

    overlay.className = 'gb-modal-overlay';

    const modalContainer = document.createElement('div');

    modalContainer.className = 'gb-modal-container';

    const messageElement = document.createElement('p');

    messageElement.textContent = message;

    const buttonContainer = document.createElement('div');

    buttonContainer.className = 'gb-modal-buttons';

    const confirmButton = document.createElement('button');

    confirmButton.className = 'gb-modal-confirm';
    confirmButton.textContent = chrome.i18n.getMessage("confirmButtonText");

    const cancelButton = document.createElement('button');

    cancelButton.className = 'gb-modal-cancel';
    cancelButton.textContent = chrome.i18n.getMessage("cancelButtonText");

    const cleanup = () => {
      document.body.removeChild(overlay);
      window.removeEventListener('keydown', handleEsc);
    };

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    confirmButton.addEventListener('click', handleConfirm);
    cancelButton.addEventListener('click', handleCancel);
    overlay.addEventListener('click', (e) => {
      // Close only if the overlay itself is clicked, not the modal content
      if (e.target === overlay) {
        handleCancel();
      }
    });

    window.addEventListener('keydown', handleEsc);

    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(confirmButton);
    modalContainer.appendChild(messageElement);
    modalContainer.appendChild(buttonContainer);
    overlay.appendChild(modalContainer);

    document.body.appendChild(overlay);
  });
};
