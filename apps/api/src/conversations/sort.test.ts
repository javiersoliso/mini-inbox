import { describe, expect, it } from "vitest";
import { Store } from "../store";
import { sortByMostRecent } from "./sort";

describe("sortByMostRecent", () => {
  it("pone primero la conversación con el mensaje más reciente", () => {
    const sorted = sortByMostRecent(new Store().listConversations());

    // c1 24/11/2026 10:00 · c6 24/11/2026 08:05 · c4 23/11/2026 16:45
    // c3 05/11/2026 18:30 · c5 30/10/2026 11:20 · c2 28/12/2025 09:00
    expect(sorted.map((conversation) => conversation.id)).toEqual([
      "c1",
      "c6",
      "c4",
      "c3",
      "c5",
      "c2",
    ]);
  });
});
