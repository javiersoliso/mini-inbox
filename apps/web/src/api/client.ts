import {
  ConversationSchema,
  type CreateConversationInput,
  MessageSchema,
  type SendMessageBody,
  type StatusFilter,
  type UpdateConversationBody,
} from "@mini-inbox/types";
import { z } from "zod";

export class ApiError extends Error {
  readonly status: number;
  readonly details: string[];

  constructor(message: string, status: number, details: string[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const ErrorBodySchema = z.object({
  error: z.string(),
  issues: z.array(z.object({ path: z.string(), message: z.string() })).optional(),
});

async function request<T>(path: string, schema: z.ZodType<T>, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const parsed = ErrorBodySchema.safeParse(data);
    if (!parsed.success) throw new ApiError(`Error ${response.status}`, response.status);
    const details = (parsed.data.issues ?? []).map((issue) => issue.message);
    throw new ApiError(parsed.data.error, response.status, details);
  }

  return schema.parse(data);
}

const conversationPath = (id: string) => `/api/conversations/${encodeURIComponent(id)}`;

export const api = {
  listConversations: (status: StatusFilter) =>
    request(`/api/conversations?${new URLSearchParams({ status })}`, z.array(ConversationSchema)),

  updateConversation: (id: string, body: UpdateConversationBody) =>
    request(conversationPath(id), ConversationSchema, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getConversation: (id: string) => request(conversationPath(id), ConversationSchema),

  listMessages: (id: string) => request(`${conversationPath(id)}/messages`, z.array(MessageSchema)),

  createConversation: (body: CreateConversationInput) =>
    request("/api/conversations", ConversationSchema, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  sendMessage: (id: string, body: SendMessageBody) =>
    request(`${conversationPath(id)}/messages`, MessageSchema, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
