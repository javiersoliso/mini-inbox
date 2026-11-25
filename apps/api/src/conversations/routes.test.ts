import { describe, expect, it } from "vitest";
import { buildApp } from "../app";

describe("/api/conversations", () => {
  it("lista las conversaciones de ejemplo", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/conversations" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveLength(6);
  });

  it("devuelve 404 si la conversación no existe", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/conversations/no-existe" });

    expect(response.statusCode).toBe(404);
  });

  it("crea una conversación", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/conversations",
      payload: { contactName: "Daniela Ríos", phone: "+573001112233" },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ contactName: "Daniela Ríos", phone: "+573001112233" });
  });

  it("rechaza datos inválidos al crear una conversación", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/conversations",
      payload: { contactName: "", phone: "123" },
    });

    expect(response.statusCode).toBe(400);
  });

  it("envía un mensaje como agente y actualiza la conversación", async () => {
    const app = buildApp();
    const sent = await app.inject({
      method: "POST",
      url: "/api/conversations/c3/messages",
      payload: { text: "Abren la próxima semana." },
    });
    expect(sent.statusCode).toBe(201);

    const conversation = await app.inject({ method: "GET", url: "/api/conversations/c3" });
    expect(conversation.json()).toMatchObject({ lastMessage: "Abren la próxima semana." });

    const messages = await app.inject({ method: "GET", url: "/api/conversations/c3/messages" });
    expect(messages.json()).toHaveLength(2);

    // La conversación respondida pasa a ser la más reciente de la bandeja.
    const inbox = await app.inject({ method: "GET", url: "/api/conversations" });
    expect(inbox.json()[0]).toMatchObject({ id: "c3", lastMessage: "Abren la próxima semana." });
  });

  it("rechaza mensajes vacíos", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/conversations/c3/messages",
      payload: { text: "   " },
    });

    expect(response.statusCode).toBe(400);
  });
});
