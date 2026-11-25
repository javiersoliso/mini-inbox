import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { conversationKeys, invalidateAfterSendMessage } from "./query-keys";

describe("invalidateAfterSendMessage", () => {
  it("marca como desactualizada la bandeja, no solo los mensajes del chat", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(conversationKeys.list("open"), []);
    queryClient.setQueryData(conversationKeys.list("all"), []);
    queryClient.setQueryData(conversationKeys.detail("c1"), {});
    queryClient.setQueryData(conversationKeys.messages("c1"), []);

    await invalidateAfterSendMessage(queryClient);

    for (const key of [
      conversationKeys.list("open"),
      conversationKeys.list("all"),
      conversationKeys.detail("c1"),
      conversationKeys.messages("c1"),
    ]) {
      expect(queryClient.getQueryState(key)?.isInvalidated, JSON.stringify(key)).toBe(true);
    }
  });
});
