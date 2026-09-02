// Brazilian date/time input helpers: dd/mm/aaaa and HH:mm.

/** Progressive mask for a `dd/mm/aaaa` text field. */
export function maskDateBR(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(
    (p) => p.length > 0,
  );
  return parts.join("/");
}

/** Progressive mask for an `HH:mm` text field. */
export function maskTimeBR(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

/**
 * `YYYY-MM-DDTHH:mm:00` in local time (no timezone offset), which is what the
 * API's `LocalDateTime` fields expect — keeps the stored time equal to what the
 * user typed instead of shifting it to UTC.
 */
export function toLocalISOString(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}` +
    `T${p(date.getHours())}:${p(date.getMinutes())}:00`
  );
}

/** `dd/mm/aaaa` for a Date. */
export function formatDateBR(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Parses `dd/mm/aaaa` + `HH:mm` into a Date in local time.
 * Returns null when either part is malformed or not a real calendar date/time.
 */
export function parseDateTimeBR(dateStr: string, timeStr: string): Date | null {
  const d = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateStr.trim());
  const t = /^(\d{2}):(\d{2})$/.exec(timeStr.trim());
  if (!d || !t) return null;

  const day = Number(d[1]);
  const month = Number(d[2]);
  const year = Number(d[3]);
  const hours = Number(t[1]);
  const minutes = Number(t[2]);

  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (hours > 23 || minutes > 59) return null;

  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  // Reject overflow like 31/02 that Date silently rolls forward.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}
