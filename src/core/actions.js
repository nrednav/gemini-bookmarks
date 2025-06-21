import { addBookmark, removeBookmark } from './logic';
import { renderUi } from '../ui/render-ui';

export const toggleBookmark = async (dependencies, { id, content, tags }) => {
  const { stateManager } = dependencies;
  const currentState = stateManager.getState();
  const existingBookmark = currentState.bookmarks.find(bookmark => bookmark.id === id);

  let nextState;

  if (existingBookmark) {
    nextState = removeBookmark(currentState, id);
  } else {
    const newBookmark = { id, content, tags };
    nextState = addBookmark(currentState, newBookmark);
  }

  stateManager.setState(nextState);

  await stateManager.saveStateToStorage();

  renderUi(dependencies);
}
