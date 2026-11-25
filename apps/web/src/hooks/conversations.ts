import type {
  CreateConversationInput,
  SendMessageBody,
  StatusFilter,
  UpdateConversationBody,
} from "@mini-inbox/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { conversationKeys, invalidateAfterSendMessage } from "./query-keys";

export function useConversations(status: StatusFilter) {
  return useQuery({
    queryKey: conversationKeys.list(status),
    queryFn: () => api.listConversations(status),
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
    mutationFn: (body: CreateConversationInput) => api.createConversation(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: conversationKeys.lists() }),
  });
}

export function useUpdateConversationStatus(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateConversationBody) => api.updateConversation(conversationId, body),
    // Cambia el detalle y en qué listas filtradas aparece la conversación.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: conversationKeys.all }),
  });
}
