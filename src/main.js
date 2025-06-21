import { elementSelectors } from "./data/element-selectors";
import { logger } from "./shell/logger";
import { createConversationKey } from "./core/create-conversation-key";
import { injectUi } from './ui/inject-ui';
import { renderUi } from './ui/render-ui';
import { StateManager } from "./core/state-manager";
import { waitForElement } from './helpers/wait-for-element'
import { setupEventListeners } from "./shell/setup-event-listeners";
import { startObserver } from "./shell/start-observer";
import { injectBookmarkButton } from "./ui/inject-bookmark-button";

const main = async () => {
  logger.info("Loaded.");

  await waitForElement(
    window.document.body.querySelector('main') || window.document.body,
    elementSelectors.modelResponse.container
  );

  const conversationKey = createConversationKey(window.location.pathname);
  const stateManager = new StateManager({ conversationKey });

  await stateManager.loadStateFromStorage();

  const postUiInjection = injectUi(window, elementSelectors);

  for (const modelResponse of postUiInjection.uiElements.modelResponses) {
    await injectBookmarkButton(modelResponse, {
      window: postUiInjection.window,
      uiElements: postUiInjection.uiElements,
      elementSelectors: elementSelectors,
      stateManager: stateManager
    });
  }

  const postEventListenerSetup = setupEventListeners({
    window: postUiInjection.window,
    uiElements: postUiInjection.uiElements,
    elementSelectors: elementSelectors,
    stateManager: stateManager,
  });

  const postObserverStart = startObserver({
    window: postEventListenerSetup.window,
    uiElements: postEventListenerSetup.uiElements,
    elementSelectors: elementSelectors,
    stateManager: postEventListenerSetup.stateManager
  });

  renderUi({
    window: postObserverStart.window,
    uiElements: postEventListenerSetup.uiElements,
    elementSelectors: elementSelectors,
    stateManager: postObserverStart.stateManager
  });
};

if (document.readyState !== "loading") {
  main();
} else {
  document.addEventListener("DOMContentLoaded", () => {
    main();
  });
}
