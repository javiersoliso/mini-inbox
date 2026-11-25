import type { FastifyInstance } from "fastify";
import {
  ConversationParamsSchema,
  CreateConversationBodySchema,
  ListConversationsQuerySchema,
  SendMessageBodySchema,
  UpdateConversationBodySchema,
} from "@mini-inbox/types";
import type { Store } from "../store";
import { sortByMostRecent } from "./sort";

const notFound = { error: "Conversación no encontrada" };

export function conversationRoutes(app: FastifyInstance, store: Store): void {
  app.get("/api/conversations", async (request) => {
    const { status } = ListConversationsQuerySchema.parse(request.query);
    return sortByMostRecent(store.listConversations(status));
  });

  app.post("/api/conversations", async (request, reply) => {
    const body = CreateConversationBodySchema.parse(request.body);
    const conversation = store.createConversation(body);
    return reply.status(201).send(conversation);
  });

  app.get("/api/conversations/:id", async (request, reply) => {
    const { id } = ConversationParamsSchema.parse(request.params);
    const conversation = store.getConversation(id);
    if (!conversation) return reply.status(404).send(notFound);
    return conversation;
  });

  // PATCH porque es una actualización parcial de la conversación (hoy solo el estado).
  app.patch("/api/conversations/:id", async (request, reply) => {
    const { id } = ConversationParamsSchema.parse(request.params);
    const { status } = UpdateConversationBodySchema.parse(request.body);
    const conversation = store.updateStatus(id, status);
    if (!conversation) return reply.status(404).send(notFound);
    return conversation;
  });

  app.get("/api/conversations/:id/messages", async (request, reply) => {
    const { id } = ConversationParamsSchema.parse(request.params);
    const messages = store.listMessages(id);
    if (!messages) return reply.status(404).send(notFound);
    return messages;
  });

  app.post("/api/conversations/:id/messages", async (request, reply) => {
    const { id } = ConversationParamsSchema.parse(request.params);
    const { text } = SendMessageBodySchema.parse(request.body);
    const message = store.addAgentMessage(id, text);
    if (!message) return reply.status(404).send(notFound);
    return reply.status(201).send(message);
  });
}
