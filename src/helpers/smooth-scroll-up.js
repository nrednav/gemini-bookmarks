/**
 * How many pixels to vertically scroll by on every animation frame
 */
const SCROLL_STEP_PX = 40;

/**
 * How long to wait at scrollTop === 0 before assuming no more content will load.
 */
const TOP_REACHED_TIMEOUT_MS = 3000;

/**
 * Initiates a smooth upward scroll on a container.
 * @param {HTMLElement|Window} scrollContainer - The element to scroll.
 * @returns {{cancel: () => void}} An object with a function to cancel the animation.
 */
export const smoothScrollUp = (scrollContainer) => {
  let animationFrameId;
  let topTimeoutId = null;

  const cleanup = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    if (topTimeoutId) {
      clearTimeout(topTimeoutId);
    }
  };

  const step = () => {
    const currentScrollTop =
      scrollContainer === window
        ? window.scrollY
        : scrollContainer["scrollTop"];

    if (currentScrollTop === 0) {
      if (!topTimeoutId) {
        topTimeoutId = setTimeout(cleanup, TOP_REACHED_TIMEOUT_MS);
      }

      animationFrameId = requestAnimationFrame(step);

      return;
    } else {
      if (topTimeoutId) {
        clearTimeout(topTimeoutId);
        topTimeoutId = null;
      }
    }

    const newScrollTop = Math.max(0, currentScrollTop - SCROLL_STEP_PX);

    scrollContainer.scrollTo({ top: newScrollTop, behavior: "auto" });

    animationFrameId = requestAnimationFrame(step);
  };

  animationFrameId = requestAnimationFrame(step);

  return { cancel: cleanup };
};
