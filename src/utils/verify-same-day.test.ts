import { describe, expect, it } from "vitest";
import { verifySameDay } from "./verify-same-day";

describe("verifySameDay", () => {
  it("returns true when filter date is not provided", () => {
    expect(verifySameDay("2025-01-10", null)).toBe(true);
    expect(verifySameDay(undefined, null)).toBe(true);
  });

  it("returns false when base date is not provided and filter exists", () => {
    expect(verifySameDay(undefined, new Date(2025, 0, 10))).toBe(false);
  });

  it("matches same day for string and Date", () => {
    const filter = new Date(2025, 0, 10, 12, 0, 0);
    expect(verifySameDay("2025-01-10", filter)).toBe(true);
  });

  it("returns false for different days", () => {
    const filter = new Date(2025, 0, 11, 12, 0, 0);
    expect(verifySameDay("2025-01-10", filter)).toBe(false);
  });
});
