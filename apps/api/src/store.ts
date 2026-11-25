import { randomUUID } from "node:crypto";
import type { Conversation, CreateConversationBody, Message } from "@mini-inbox/types";
import { type SeedConversation, seedConversations } from "./data/seed";
import { formatProviderDate } from "./provider/date";

/** "Base de datos" en memoria. Se reinicia con los datos de ejemplo cada vez que arranca la API. */
export class Store {
  private readonly conversations = new Map<string, Conversation>();
  private readonly messages = new Map<string, Message[]>();

  constructor(seed: SeedConversation[] = seedConversations) {
    for (const item of seed) {
      const messages: Message[] = item.messages.map((message) => ({
        ...message,
        conversationId: item.id,
      }));
      const last = messages.at(-1);
      this.conversations.set(item.id, {
        id: item.id,
        contactName: item.contactName,
        phone: item.phone,
        lastMessage: last?.text ?? "",
        lastMessageAt: last?.sentAt ?? formatProviderDate(new Date()),
      });
      this.messages.set(item.id, messages);
    }
  }

  listConversations(): Conversation[] {
    return [...this.conversations.values()];
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  listMessages(conversationId: string): Message[] | undefined {
    return this.messages.get(conversationId);
  }

  createConversation(input: CreateConversationBody): Conversation {
    const conversation: Conversation = {
      id: randomUUID(),
      contactName: input.contactName,
      phone: input.phone,
      lastMessage: "",
      lastMessageAt: formatProviderDate(new Date()),
    };
    this.conversations.set(conversation.id, conversation);
    this.messages.set(conversation.id, []);
    return conversation;
  }

  addAgentMessage(conversationId: string, text: string): Message | undefined {
    const conversation = this.conversations.get(conversationId);
    const messages = this.messages.get(conversationId);
    if (!conversation || !messages) return undefined;

    const message: Message = {
      id: randomUUID(),
      conversationId,
      author: "agent",
      text,
      sentAt: formatProviderDate(new Date()),
    };
    messages.push(message);
    this.conversations.set(conversationId, {
      ...conversation,
      lastMessage: message.text,
      lastMessageAt: message.sentAt,
    });
    return message;
  }
}
