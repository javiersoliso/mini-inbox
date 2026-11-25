const providerDateFormat = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Formatea una fecha igual que el proveedor de WhatsApp: "dd/mm/yyyy HH:mm" (hora de Colombia). */
export function formatProviderDate(date: Date): string {
  const parts = Object.fromEntries(
    providerDateFormat.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}
