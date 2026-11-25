import type { StatusFilter } from "@mini-inbox/types";
import type { QueryClient } from "@tanstack/react-query";

const all = ["conversations"] as const;

/**
 * Claves de TanStack Query organizadas en jerarquía: todo cuelga de ["conversations"],
 * así que invalidar ese prefijo invalida la lista, los detalles y los mensajes.
 */
export const conversationKeys = {
  all,
  lists: () => [...all, "list"] as const,
  list: (status: StatusFilter) => [...all, "list", status] as const,
  detail: (id: string) => [...all, "detail", id] as const,
  messages: (id: string) => [...all, "detail", id, "messages"] as const,
};

/**
 * Enviar un mensaje cambia más que el chat: también el último mensaje, la fecha y la
 * posición de la conversación en la bandeja. Por eso se invalida todo el prefijo
 * ["conversations"] (lista, detalle y mensajes) y no solo los mensajes.
 */
export function invalidateAfterSendMessage(queryClient: QueryClient): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: conversationKeys.all });
}
