const dateTimeFormat = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  dateStyle: "short",
  timeStyle: "short",
});

/** Muestra un instante ISO 8601 en hora de Colombia, que es la de los agentes. */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}
