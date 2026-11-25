import Fastify, { type FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { conversationRoutes } from "./conversations/routes";
import { Store } from "./store";

function hasStatusCode(error: unknown): error is { statusCode: number } {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  );
}

interface BuildAppOptions {
  store?: Store;
  logger?: boolean;
}

export function buildApp({
  store = new Store(),
  logger = false,
}: BuildAppOptions = {}): FastifyInstance {
  const app = Fastify({ logger });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "Datos inválidos",
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    // Errores propios de Fastify (p. ej. JSON mal formado) traen su statusCode 4xx.
    const statusCode = hasStatusCode(error) ? error.statusCode : 500;
    if (statusCode >= 500) {
      app.log.error(error);
      return reply.status(500).send({ error: "Error interno del servidor" });
    }
    return reply
      .status(statusCode)
      .send({ error: error instanceof Error ? error.message : "Error" });
  });

  conversationRoutes(app, store);
  return app;
}
