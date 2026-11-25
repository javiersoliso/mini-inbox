import { type StatusFilter, StatusFilterSchema } from "@mini-inbox/types";

/** Por defecto se ven las abiertas: la historia de usuario es "enfocarme en lo que falta". */
export const DEFAULT_STATUS_FILTER: StatusFilter = "open";

/**
 * Lee el filtro de la URL (?status=...). Se valida con el mismo esquema que usa la API,
 * y si falta o no es válido (p. ej. ?status=foo) se usa el valor por defecto.
 */
export function readStatusFilter(search: string): StatusFilter {
  const parsed = StatusFilterSchema.safeParse(new URLSearchParams(search).get("status"));
  return parsed.success ? parsed.data : DEFAULT_STATUS_FILTER;
}

/** Devuelve la misma URL con ?status=... actualizado, conservando el resto. */
export function withStatusFilter(href: string, filter: StatusFilter): string {
  const url = new URL(href);
  url.searchParams.set("status", filter);
  return url.toString();
}
