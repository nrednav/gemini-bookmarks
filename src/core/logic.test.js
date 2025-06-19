import { initialState } from "./state.js";
import {
  addBookmark,
  getUniqueTags,
  filterBookmarksByTag
} from "./logic.js";

function assertEquals(actual, expected, message) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Assertion failed: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
}

function testAddBookmark() {
  const state = addBookmark(initialState, { content: 'A', tags: ['t1'] });

  assertEquals(state.bookmarks.length, 1, 'addBookmark should add one item.');
  assertEquals(state.bookmarks[0].content, 'A', 'addBookmark should set bookmark content correctly.');
}

function testGetUniqueTags() {
  let state = addBookmark(initialState, { content: 'A', tags: ['t1', 't2'] });

  state = addBookmark(state, { content: 'B', tags: ['t3', 't1'] });

  const tags = getUniqueTags(state);

  assertEquals(tags, ['t1', 't2', 't3'], 'getUniqueTags should return unique, sorted tags');
}

function testFilterBookmarksByTag() {
  let state = addBookmark(initialState, { content: 'A', tags: ['t1', 't2'] });

  state = addBookmark(state, { content: 'B', tags: ['t3', 't1'] });

  const filtered = filterBookmarksByTag(state, 't1');

  assertEquals(filtered.length, 2, 'filterBookmarksByTag should find all matching bookmarks');

  const filtered2 = filterBookmarksByTag(state, 't2');

  assertEquals(filtered2.length, 1, 'filterBookmarksByTag should find a single matching bookmark');
  assertEquals(filtered2[0].content, 'A', 'filterBookmarksByTag should find the correct bookmark');
}

export function runCoreLogicTests() {
  try {
    testAddBookmark();
    testGetUniqueTags();
    testFilterBookmarksByTag();
    console.log('%c✅ All core logic tests passed!', 'color: green; font-weight: bold;');
  } catch(e) {
    console.error('%c❌ A core logic test failed.', 'color: red; font-weight: bold;');
    console.error(e);
  }
}
