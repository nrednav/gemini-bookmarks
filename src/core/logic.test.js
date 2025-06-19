function assertEquals(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Assertion failed: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
}

function testAddBookmark() {
  const state = GeminiBookmarker.addBookmark(GeminiBookmarker.initialState, { id: 'test-id-1', content: 'A', tags: ['t1'] });

  assertEquals(state.bookmarks.length, 1, 'addBookmark should add one item.');
  assertEquals(state.bookmarks[0].content, 'A', 'addBookmark should set bookmark content correctly.');
  assertEquals(state.bookmarks[0].id, 'test-id-1', 'addBookmark should use the provided ID.');
}

function testRemoveBookmark() {
  let state = GeminiBookmarker.addBookmark(GeminiBookmarker.initialState, { id: 'test-id-1', content: 'A', tags: ['t1'] });

  state = GeminiBookmarker.addBookmark(state, { id: 'test-id-2', content: 'B', tags: [] });
  state = GeminiBookmarker.removeBookmark(state, 'test-id-1');

  assertEquals(state.bookmarks.length, 1, 'removeBookmark should remove one item.');
  assertEquals(state.bookmarks[0].id, 'test-id-2', 'removeBookmark should remove the correct item.');
}

function testGetUniqueTags() {
  let state = GeminiBookmarker.addBookmark(GeminiBookmarker.initialState, { id: 'test-id-1', content: 'A', tags: ['t1', 't2'] });

  state = GeminiBookmarker.addBookmark(state, { id: 'test-id-2', content: 'B', tags: ['t3', 't1'] });

  const tags = GeminiBookmarker.getUniqueTags(state);

  assertEquals(tags, ['t1', 't2', 't3'], 'getUniqueTags should return unique, sorted tags');
}

function testFilterBookmarksByTags() {
  let state = GeminiBookmarker.addBookmark(GeminiBookmarker.initialState, { id: 'test-id-1', content: 'A', tags: ['t1', 't2'] });

  state = GeminiBookmarker.addBookmark(state, { id: 'test-id-2', content: 'B', tags: ['t3', 't1'] });

  const filteredBookmarks = GeminiBookmarker.filterBookmarksByTags(state, ['t1', 't3']);

  assertEquals(filteredBookmarks.length, 2, 'filterBookmarksByTags should find all matching bookmarks');
}

export function runCoreLogicTests() {
  try {
    testAddBookmark();
    testRemoveBookmark();
    testGetUniqueTags();
    testFilterBookmarksByTags();

    console.log('%c✅ All core logic tests passed!', 'color: green; font-weight: bold;');
  } catch(e) {
    console.error('%c❌ A core logic test failed.', 'color: red; font-weight: bold;');
    console.error(e);
  }
}
