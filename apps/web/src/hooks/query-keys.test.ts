import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { conversationKeys, invalidateAfterSendMessage } from "./query-keys";

describe("invalidateAfterSendMessage", () => {
  it("marca como desactualizada la bandeja, no solo los mensajes del chat", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(conversationKeys.list(), []);
    queryClient.setQueryData(conversationKeys.detail("c1"), {});
    queryClient.setQueryData(conversationKeys.messages("c1"), []);

    await invalidateAfterSendMessage(queryClient);

    expect(queryClient.getQueryState(conversationKeys.list())?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(conversationKeys.detail("c1"))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(conversationKeys.messages("c1"))?.isInvalidated).toBe(true);
  });
});
