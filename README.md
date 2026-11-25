# Mini Inbox

Versión reducida de la bandeja de conversaciones que usan los agentes para atender a los
estudiantes que escriben por WhatsApp al chatbot.

> **Nota:** el enunciado de la prueba técnica (`prueba.pdf`) pide clonar un repositorio cuyo
> enlace no venía ni en el PDF ni en el correo. Este repositorio **reconstruye el punto de
> partida** a partir del enunciado (stack, estructura, endpoints y errores reportados). La
> rama `main` es ese punto de partida y la rama `solucion` contiene la solución.

## Stack

| Parte              | Tecnología                               |
| ------------------ | ---------------------------------------- |
| Gestor de paquetes | Bun (workspaces)                         |
| `apps/api`         | Node + Fastify + TypeScript              |
| `apps/web`         | Vite + React + TanStack Query            |
| `packages/types`   | Esquemas compartidos con Zod (API y web) |
| Tests              | Vitest                                   |
| Lint / formato     | oxlint / oxfmt                           |

No hay base de datos: la API guarda todo en memoria a partir de `apps/api/src/data/seed.ts`.

## Cómo correrlo

Requisitos: Bun 1.2 o superior.

```bash
bun install
bun run dev          # API en http://localhost:3001 y web en http://localhost:5173
```

```bash
bun run test         # tests
bun run check-types  # verificación de tipos
bun run lint         # linter
bun run fmt          # formatea el código
```
