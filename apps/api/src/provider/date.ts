/** Colombia está en UTC−5 todo el año (no tiene horario de verano). */
const COLOMBIA_UTC_OFFSET_MINUTES = -5 * 60;

const PROVIDER_DATE = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/;

export class InvalidProviderDateError extends Error {
  constructor(value: string) {
    super(`Fecha del proveedor inválida: "${value}" (se espera dd/mm/yyyy HH:mm)`);
    this.name = "InvalidProviderDateError";
  }
}

/**
 * Convierte una fecha del proveedor de WhatsApp ("dd/mm/yyyy HH:mm", hora de Colombia)
 * en un instante absoluto.
 *
 * Se parsea a mano porque `new Date()` no sirve para este formato: lo interpreta como
 * mm/dd (o lo rechaza), depende de la zona horaria de la máquina y además "corrige"
 * fechas imposibles (31/02 → 3 de marzo) en vez de fallar.
 */
export function parseProviderDate(value: string): Date {
  const match = PROVIDER_DATE.exec(value);
  if (!match) throw new InvalidProviderDateError(value);

  const [day, month, year, hour, minute] = match.slice(1).map(Number);
  const asIfUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));

  // Si Date.UTC tuvo que "corregir" algún campo, la fecha no existe.
  const isRealDate =
    asIfUtc.getUTCFullYear() === year &&
    asIfUtc.getUTCMonth() === month - 1 &&
    asIfUtc.getUTCDate() === day &&
    asIfUtc.getUTCHours() === hour &&
    asIfUtc.getUTCMinutes() === minute;
  if (!isRealDate) throw new InvalidProviderDateError(value);

  return new Date(asIfUtc.getTime() - COLOMBIA_UTC_OFFSET_MINUTES * 60_000);
}
