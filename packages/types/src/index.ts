import { z } from "zod";

/**
 * Instante en ISO 8601 UTC, p. ej. "2026-11-24T15:00:00.000Z".
 * El formato del proveedor de WhatsApp ("dd/mm/yyyy HH:mm", hora de Colombia) se convierte
 * a este al entrar a la API (ver apps/api/src/provider/date.ts) y no circula por el sistema.
 */
export const DateTimeSchema = z.iso.datetime();

const PHONE_ERROR = "Número inválido: incluye el indicativo del país, p. ej. +57 300 123 4567";

/** Número como se guarda y como lo usa WhatsApp: formato E.164, p. ej. "+573001234567". */
export const PhoneSchema = z.e164({ error: PHONE_ERROR });

/**
 * Número como lo escribe una persona ("+57 300 123 4567", "+57 (300) 123-4567"):
 * se quitan espacios, guiones, puntos y paréntesis, y el resultado debe ser E.164.
 */
export const PhoneInputSchema = z
  .string()
  .transform((value) => value.replace(/[\s().-]/g, ""))
  .pipe(PhoneSchema);

export const MessageAuthorSchema = z.enum(["contact", "agent"]);
export type MessageAuthor = z.infer<typeof MessageAuthorSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  author: MessageAuthorSchema,
  text: z.string(),
  sentAt: DateTimeSchema,
});
export type Message = z.infer<typeof MessageSchema>;

export const ConversationStatusSchema = z.enum(["open", "resolved"]);
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;

export const ConversationSchema = z.object({
  id: z.string(),
  contactName: z.string(),
  phone: PhoneSchema,
  status: ConversationStatusSchema,
  lastMessage: z.string(),
  lastMessageAt: DateTimeSchema,
});
export type Conversation = z.infer<typeof ConversationSchema>;

/** Filtro de la bandeja: un estado concreto o "all" para ver todas. */
export const StatusFilterSchema = z.enum(["open", "resolved", "all"]);
export type StatusFilter = z.infer<typeof StatusFilterSchema>;

/** Sin ?status la API devuelve todas, como antes de existir el filtro. */
export const ListConversationsQuerySchema = z.object({
  status: StatusFilterSchema.default("all"),
});

/** Estricto: un campo de más (p. ej. "contactName") es un error y no se ignora en silencio. */
export const UpdateConversationBodySchema = z.strictObject({
  status: ConversationStatusSchema,
});
export type UpdateConversationBody = z.infer<typeof UpdateConversationBodySchema>;

export const ConversationParamsSchema = z.object({
  id: z.string().min(1),
});

export const CreateConversationBodySchema = z.object({
  contactName: z.string().trim().min(1, "El nombre es obligatorio"),
  phone: PhoneInputSchema,
});
/** Lo que envía el cliente (teléfono tal como lo escribió la persona). */
export type CreateConversationInput = z.input<typeof CreateConversationBodySchema>;
/** Lo que recibe la API después de validar (teléfono ya normalizado). */
export type CreateConversationBody = z.output<typeof CreateConversationBodySchema>;

export const SendMessageBodySchema = z.object({
  text: z.string().trim().min(1, "El mensaje no puede estar vacío").max(4096),
});
export type SendMessageBody = z.infer<typeof SendMessageBodySchema>;
