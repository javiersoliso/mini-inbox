import { describe, expect, it } from "vitest";
import { InvalidProviderDateError, parseProviderDate } from "./date";

describe("parseProviderDate", () => {
  it("interpreta dd/mm/yyyy (día primero), no mm/dd", () => {
    expect(parseProviderDate("05/11/2026 18:30").toISOString()).toBe("2026-11-05T23:30:00.000Z");
  });

  it("usa la hora de Colombia (UTC−5) sin importar la zona de la máquina", () => {
    expect(parseProviderDate("24/11/2026 10:00").toISOString()).toBe("2026-11-24T15:00:00.000Z");
  });

  it("cruza bien el cambio de día y de año", () => {
    expect(parseProviderDate("31/12/2025 21:30").toISOString()).toBe("2026-01-01T02:30:00.000Z");
  });

  it.each(["2026-11-24 10:00", "24/11/2026", "24-11-2026 10:00", ""])(
    "rechaza formatos distintos al del proveedor: %j",
    (value) => {
      expect(() => parseProviderDate(value)).toThrow(InvalidProviderDateError);
    },
  );

  it.each(["31/02/2026 10:00", "00/11/2026 10:00", "24/13/2026 10:00", "24/11/2026 24:00"])(
    "rechaza fechas que no existen en vez de correrlas: %j",
    (value) => {
      expect(() => parseProviderDate(value)).toThrow(InvalidProviderDateError);
    },
  );
});
