import { randomUUID } from "node:crypto";
import type {
  Conversation,
  ConversationStatus,
  CreateConversationBody,
  Message,
  StatusFilter,
} from "@mini-inbox/types";
import { type SeedConversation, seedConversations } from "./data/seed";
import { parseProviderDate } from "./provider/date";

const now = () => new Date().toISOString();

/** "Base de datos" en memoria. Se reinicia con los datos de ejemplo cada vez que arranca la API. */
export class Store {
  private readonly conversations = new Map<string, Conversation>();
  private readonly messages = new Map<string, Message[]>();

  constructor(seed: SeedConversation[] = seedConversations) {
    for (const item of seed) {
      // Frontera con el proveedor: aquí (y solo aquí) se convierte su formato de fecha.
      const messages: Message[] = item.messages.map((message) => ({
        ...message,
        conversationId: item.id,
        sentAt: parseProviderDate(message.sentAt).toISOString(),
      }));
      const last = messages.at(-1);
      this.conversations.set(item.id, {
        id: item.id,
        contactName: item.contactName,
        phone: item.phone,
        status: item.status ?? "open",
        lastMessage: last?.text ?? "",
        lastMessageAt: last?.sentAt ?? now(),
      });
      this.messages.set(item.id, messages);
    }
  }

  listConversations(filter: StatusFilter = "all"): Conversation[] {
    const conversations = [...this.conversations.values()];
    if (filter === "all") return conversations;
    return conversations.filter((conversation) => conversation.status === filter);
  }

  updateStatus(id: string, status: ConversationStatus): Conversation | undefined {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    const updated = { ...conversation, status };
    this.conversations.set(id, updated);
    return updated;
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
      status: "open",
      lastMessage: "",
      lastMessageAt: now(),
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
      sentAt: now(),
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
