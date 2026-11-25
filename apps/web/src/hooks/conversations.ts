import type { CreateConversationBody, SendMessageBody } from "@mini-inbox/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { conversationKeys, invalidateAfterSendMessage } from "./query-keys";

export function useConversations() {
  return useQuery({
    queryKey: conversationKeys.list(),
    queryFn: () => api.listConversations(),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: conversationKeys.detail(id),
    queryFn: () => api.getConversation(id),
  });
}

export function useMessages(id: string) {
  return useQuery({
    queryKey: conversationKeys.messages(id),
    queryFn: () => api.listMessages(id),
  });
}

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SendMessageBody) => api.sendMessage(conversationId, body),
    onSuccess: () => invalidateAfterSendMessage(queryClient),
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateConversationBody) => api.createConversation(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: conversationKeys.list() }),
  });
}
