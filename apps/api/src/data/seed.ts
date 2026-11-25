import type { MessageAuthor } from "@mini-inbox/types";

/**
 * Datos de ejemplo tal como los entrega el proveedor de WhatsApp.
 * Las fechas vienen en formato "dd/mm/yyyy HH:mm" (hora de Colombia).
 */
export interface SeedMessage {
  id: string;
  author: MessageAuthor;
  text: string;
  sentAt: string;
}

export interface SeedConversation {
  id: string;
  contactName: string;
  phone: string;
  messages: SeedMessage[];
}

export const seedConversations: SeedConversation[] = [
  {
    id: "c1",
    contactName: "Laura Gómez",
    phone: "+573001234567",
    messages: [
      {
        id: "m1",
        author: "contact",
        text: "Hola, ¿hasta cuándo hay plazo para pagar la matrícula?",
        sentAt: "24/11/2026 09:52",
      },
      {
        id: "m2",
        author: "agent",
        text: "Hola Laura, el plazo ordinario va hasta el 30 de noviembre.",
        sentAt: "24/11/2026 09:58",
      },
      {
        id: "m3",
        author: "contact",
        text: "¿Y se puede pagar por cuotas?",
        sentAt: "24/11/2026 10:00",
      },
    ],
  },
  {
    id: "c2",
    contactName: "Andrés Rojas",
    phone: "+573109876543",
    messages: [
      {
        id: "m4",
        author: "contact",
        text: "Buenas, necesito el certificado de notas.",
        sentAt: "27/12/2025 17:40",
      },
      {
        id: "m5",
        author: "agent",
        text: "Lo puedes descargar en el portal, sección Certificados.",
        sentAt: "28/12/2025 08:30",
      },
      {
        id: "m6",
        author: "contact",
        text: "Gracias, ya lo descargué.",
        sentAt: "28/12/2025 09:00",
      },
    ],
  },
  {
    id: "c3",
    contactName: "Valentina Cruz",
    phone: "+573205551234",
    messages: [
      {
        id: "m7",
        author: "contact",
        text: "¿Cuándo abren inscripciones para el semillero de robótica?",
        sentAt: "05/11/2026 18:30",
      },
    ],
  },
  {
    id: "c4",
    contactName: "Mateo Herrera",
    phone: "+573157778899",
    messages: [
      {
        id: "m8",
        author: "contact",
        text: "No me carga el horario en el portal.",
        sentAt: "23/11/2026 16:20",
      },
      {
        id: "m9",
        author: "agent",
        text: "¿Desde qué navegador estás entrando?",
        sentAt: "23/11/2026 16:45",
      },
    ],
  },
  {
    id: "c5",
    contactName: "Camila Ortiz",
    phone: "+573004445566",
    messages: [
      {
        id: "m10",
        author: "contact",
        text: "¿La biblioteca abre los sábados?",
        sentAt: "30/10/2026 11:05",
      },
      {
        id: "m11",
        author: "agent",
        text: "Sí, de 8:00 a. m. a 1:00 p. m.",
        sentAt: "30/10/2026 11:20",
      },
    ],
  },
  {
    id: "c6",
    contactName: "Santiago Pérez",
    phone: "+573118889900",
    messages: [
      {
        id: "m12",
        author: "contact",
        text: "Quiero cancelar una materia, ¿qué hago?",
        sentAt: "24/11/2026 08:05",
      },
    ],
  },
];
