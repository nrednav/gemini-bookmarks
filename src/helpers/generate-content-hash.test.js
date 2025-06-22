import { describe, expect, test } from "vitest";
import { generateContentHash } from "./generate-content-hash";

describe("generateContentHash", () => {
  test("should generate a correct and consistent SHA-256 hash for a given string", async () => {
    const inputText = "hello world";
    const expectedHash =
      "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9";

    const actualHash = await generateContentHash(inputText);

    expect(actualHash).toBe(expectedHash);
  });

  test("should generate the correct hash for an empty string", async () => {
    const expectedHashForEmpty =
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    const actualHash = await generateContentHash("");

    expect(actualHash).toBe(expectedHashForEmpty);
  });

  test("should produce different hashes for different inputs", async () => {
    const hash1 = await generateContentHash("text a");
    const hash2 = await generateContentHash("text b");

    expect(hash1).not.toBe(hash2);
  });
});
