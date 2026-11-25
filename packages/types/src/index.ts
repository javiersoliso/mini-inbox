import { z } from "zod";

/** Fecha tal como la envía el proveedor de WhatsApp: "dd/mm/yyyy HH:mm" (hora de Colombia). */
export const ProviderDateSchema = z
  .string()
  .regex(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/, "Formato de fecha esperado: dd/mm/yyyy HH:mm");

export const PhoneSchema = z.string().regex(/^\+\d{10,15}$/, "Número de teléfono inválido");

export const MessageAuthorSchema = z.enum(["contact", "agent"]);
export type MessageAuthor = z.infer<typeof MessageAuthorSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  author: MessageAuthorSchema,
  text: z.string(),
  sentAt: ProviderDateSchema,
});
export type Message = z.infer<typeof MessageSchema>;

export const ConversationSchema = z.object({
  id: z.string(),
  contactName: z.string(),
  phone: PhoneSchema,
  lastMessage: z.string(),
  lastMessageAt: ProviderDateSchema,
});
export type Conversation = z.infer<typeof ConversationSchema>;

export const ConversationParamsSchema = z.object({
  id: z.string().min(1),
});

export const CreateConversationBodySchema = z.object({
  contactName: z.string().trim().min(1, "El nombre es obligatorio"),
  phone: PhoneSchema,
});
export type CreateConversationBody = z.infer<typeof CreateConversationBodySchema>;

export const SendMessageBodySchema = z.object({
  text: z.string().trim().min(1, "El mensaje no puede estar vacío").max(4096),
});
export type SendMessageBody = z.infer<typeof SendMessageBodySchema>;
