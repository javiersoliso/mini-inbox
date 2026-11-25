import { buildApp } from "./app";

const app = buildApp({ logger: true });
const port = Number(process.env.PORT ?? 3001);

app.listen({ port, host: "127.0.0.1" }).catch((error: unknown) => {
  app.log.error(error);
  process.exit(1);
});
