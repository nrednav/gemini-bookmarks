/**
 * Displays a non-blocking toast notification at the bottom of the screen.
 * @param {string} message - The message to display.
 * @param {'info' | 'success' | 'warning' | 'error'} type - The type of toast, for styling.
 * @param {number} duration - How long the toast should be visible in milliseconds.
 */
export const showToast = (message, type = "info", duration = 3000) => {
  const toast = document.createElement("div");

  toast.className = `gb-toast gb-toast--${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("gb-toast--visible");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("gb-toast--visible");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, duration);
};
