const all = ["conversations"] as const;

/**
 * Claves de TanStack Query organizadas en jerarquía: todo cuelga de ["conversations"],
 * así que invalidar ese prefijo invalida la lista, los detalles y los mensajes.
 */
export const conversationKeys = {
  all,
  list: () => [...all, "list"] as const,
  detail: (id: string) => [...all, "detail", id] as const,
  messages: (id: string) => [...all, "detail", id, "messages"] as const,
};
