import { describe, expect, it } from "vitest";
import { PhoneInputSchema } from "./index";

describe("PhoneInputSchema", () => {
  it.each([
    ["+57 300 123 4567", "+573001234567"],
    ["+57 (300) 123-4567", "+573001234567"],
    ["+57.300.123.4567", "+573001234567"],
    ["  +573001234567  ", "+573001234567"],
  ])("acepta %j y lo guarda como %j", (input, expected) => {
    expect(PhoneInputSchema.parse(input)).toBe(expected);
  });

  it.each([
    "300 123 4567", // sin indicativo: no se puede saber de qué país es
    "+57 300 abc 4567",
    "+0 300 123 4567",
    "",
  ])("rechaza %j", (input) => {
    expect(PhoneInputSchema.safeParse(input).success).toBe(false);
  });
});
