import type { Conversation } from "@mini-inbox/types";

/** Ordena la bandeja: primero la conversación con el mensaje más reciente. */
export function sortByMostRecent(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort(
    (a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt),
  );
}
