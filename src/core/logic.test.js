import { describe, test, expect } from "vitest";
import { getUniqueTags, addBookmark, removeBookmark, filterBookmarksByTags } from "./logic";
import { StateManager } from "./state-manager";
import { createConversationKey } from "./create-conversation-key";

describe("core/logic", () => {
  const stateManager = new StateManager({ conversationKey: createConversationKey("/test") });

  test("addBookmark should add a new bookmark to the state", () => {
    const newBookmark = { id: "id-one", content: "Hello world!", tags: ["tag-one"] };
    const state = addBookmark(stateManager.getInitialState(), newBookmark);

    expect(state.bookmarks.length).toBe(1);
    expect(state.bookmarks[0].id).toEqual(newBookmark.id);
    expect(state.bookmarks[0].content).toEqual(newBookmark.content);
    expect(state.bookmarks[0].tags).toEqual(newBookmark.tags);
  });

  test("removeBookmark should remove the bookmark from the state", () => {
    let state = addBookmark(stateManager.getInitialState(), { id: "id-one", content: "Hello world!", tags: ["tag-one"] });

    state = addBookmark(state, { id: "id-two", content: "Hello world!", tags: ["tag-one", "tag-two"] });

    state = removeBookmark(state, "id-one");

    expect(state.bookmarks.length).toBe(1);
    expect(state.bookmarks[0].id).toEqual("id-two");
    expect(state.bookmarks[0].content).toEqual("Hello world!");
    expect(state.bookmarks[0].tags).toEqual(["tag-one", "tag-two"]);
  });

  test("getUniqueTags should return a sorted list of unique tags from the state", () => {
    let state = addBookmark(stateManager.getInitialState(), { id: "id-one", content: "A", tags: ["a", "c"] });

    state = addBookmark(state, { id: "id-two", content: "B", tags: ["a", "b"] });

    const tags = getUniqueTags(state);

    expect(tags).toEqual(["a", "b", "c"]);
  });

  test("filterBookmarksByTags should return a list of bookmarks filtered by a list of tags", () => {
    let state = addBookmark(stateManager.getInitialState(), { id: "id-one", content: "A", tags: ["a", "c"] });

    state = addBookmark(state, { id: "id-two", content: "B", tags: ["b"] });
    state = addBookmark(state, { id: "id-four", content: "C", tags: ["b", "c"] });

    const bookmarks = filterBookmarksByTags(state, ["b"]);

    expect(bookmarks.length).toBe(2);
    expect(bookmarks[0].tags).toContain("b");
    expect(bookmarks[1].tags).toContain("b");
  });
});
