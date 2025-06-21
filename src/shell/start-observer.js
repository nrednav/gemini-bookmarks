import { main } from '../main';
import { injectBookmarkButton } from '../ui/inject-bookmark-button';

export const startObserver = (dependencies) => {
  const { window, uiElements, elementSelectors, stateManager } = dependencies;

  const previousUrl = window.location.href;

  const observer = new MutationObserver((mutations, observer) => {
    if (window.location.href !== previousUrl) {
      observer.disconnect();
      main();
      return;
    }

    const modelResponseNodes = new Set();

    for (const mutation of mutations) {
      if (mutation.type !== 'childList') {
        continue;
      }

      for (const addedNode of mutation.addedNodes) {
        if (addedNode.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }

        if (addedNode.matches(elementSelectors.modelResponse.container)) {
          modelResponseNodes.add(addedNode);
        }

        addedNode.querySelectorAll(elementSelectors.modelResponse.container).forEach((modelResponseNode) => {
          modelResponseNodes.add(modelResponseNode);
        });
      }
    }

    modelResponseNodes.forEach((modelResponseNode) => {
      injectBookmarkButton(modelResponseNode, { window, uiElements, elementSelectors, stateManager });
    });
  });

  observer.observe(window.document.body, { childList: true, subtree: true });

  return { window, uiElements, elementSelectors, stateManager };
}
