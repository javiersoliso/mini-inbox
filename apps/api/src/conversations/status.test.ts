import type { Conversation } from "@mini-inbox/types";
import { describe, expect, it } from "vitest";
import { buildApp } from "../app";

const ids = (body: Conversation[]) => body.map((conversation) => conversation.id);

describe("estado de las conversaciones", () => {
  it("una conversación nueva empieza abierta", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/conversations",
      payload: { contactName: "Daniela Ríos", phone: "+573001112233" },
    });

    expect(response.json()).toMatchObject({ status: "open" });
  });

  it("se puede marcar como resuelta y volver a abrir", async () => {
    const app = buildApp();

    const resolved = await app.inject({
      method: "PATCH",
      url: "/api/conversations/c1",
      payload: { status: "resolved" },
    });
    expect(resolved.statusCode).toBe(200);
    expect(resolved.json()).toMatchObject({ id: "c1", status: "resolved" });

    const reopened = await app.inject({
      method: "PATCH",
      url: "/api/conversations/c1",
      payload: { status: "open" },
    });
    expect(reopened.json()).toMatchObject({ id: "c1", status: "open" });
  });

  it.each([{ status: "cerrada" }, {}, { status: "resolved", contactName: "Otro nombre" }])(
    "rechaza un cuerpo inválido: %j",
    async (payload) => {
      const app = buildApp();
      const response = await app.inject({ method: "PATCH", url: "/api/conversations/c1", payload });

      expect(response.statusCode).toBe(400);
    },
  );

  it("devuelve 404 al cambiar el estado de una conversación que no existe", async () => {
    const app = buildApp();
    const response = await app.inject({
      method: "PATCH",
      url: "/api/conversations/no-existe",
      payload: { status: "resolved" },
    });

    expect(response.statusCode).toBe(404);
  });

  it("filtra la bandeja por estado y mantiene el orden por fecha", async () => {
    const app = buildApp();
    const get = (url: string) => app.inject({ method: "GET", url });

    expect(ids((await get("/api/conversations?status=open")).json())).toEqual([
      "c1",
      "c6",
      "c4",
      "c3",
    ]);
    expect(ids((await get("/api/conversations?status=resolved")).json())).toEqual(["c5", "c2"]);
    expect((await get("/api/conversations?status=all")).json()).toHaveLength(6);
    expect((await get("/api/conversations")).json()).toHaveLength(6);
  });

  it("rechaza un filtro desconocido", async () => {
    const app = buildApp();
    const response = await app.inject({ method: "GET", url: "/api/conversations?status=foo" });

    expect(response.statusCode).toBe(400);
  });
});
