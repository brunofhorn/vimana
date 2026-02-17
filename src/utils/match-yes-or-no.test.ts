import { describe, expect, it } from "vitest";
import { matchYesNo } from "./match-yes-or-no";

describe("matchYesNo", () => {
  it("returns true when filter is empty", () => {
    expect(matchYesNo("", true)).toBe(true);
    expect(matchYesNo("", false)).toBe(true);
    expect(matchYesNo("", undefined)).toBe(true);
  });

  it("matches positive filter", () => {
    expect(matchYesNo("S", true)).toBe(true);
    expect(matchYesNo("S", "S")).toBe(true);
    expect(matchYesNo("S", false)).toBe(false);
  });

  it("matches negative filter", () => {
    expect(matchYesNo("N", false)).toBe(true);
    expect(matchYesNo("N", "N")).toBe(true);
    expect(matchYesNo("N", true)).toBe(false);
  });

  it("returns false when filter is set and value is nullish", () => {
    expect(matchYesNo("S", undefined)).toBe(false);
    expect(matchYesNo("N", undefined)).toBe(false);
  });
});
