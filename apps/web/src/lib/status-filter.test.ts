import { describe, expect, it } from "vitest";
import { readStatusFilter, withStatusFilter } from "./status-filter";

describe("readStatusFilter", () => {
  it.each([
    ["?status=open", "open"],
    ["?status=resolved", "resolved"],
    ["?status=all", "all"],
  ])("lee %j de la URL", (search, expected) => {
    expect(readStatusFilter(search)).toBe(expected);
  });

  it.each(["", "?status=foo", "?status=RESOLVED", "?otra=cosa"])(
    "usa 'open' si el filtro falta o no es válido: %j",
    (search) => {
      expect(readStatusFilter(search)).toBe("open");
    },
  );
});

describe("withStatusFilter", () => {
  it("cambia solo el parámetro status y conserva el resto de la URL", () => {
    expect(withStatusFilter("http://localhost:5173/?status=open&x=1#a", "resolved")).toBe(
      "http://localhost:5173/?status=resolved&x=1#a",
    );
  });
});
