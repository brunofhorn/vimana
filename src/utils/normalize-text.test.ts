import { describe, expect, it } from "vitest";
import { normalizeText } from "./normalize-text";

describe("normalizeText", () => {
  it("returns lowercase text", () => {
    expect(normalizeText("ViMaNa")).toBe("vimana");
  });

  it("returns empty string for undefined", () => {
    expect(normalizeText(undefined)).toBe("");
  });
});
