const pad = (value: number): string => String(value).padStart(2, '0');

export function localDateOffset(offset: number, now = new Date()): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function localDateNow(now = new Date()): string {
  return localDateOffset(0, now);
}

export function isValidLocalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) return false;
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function parseLocalDate(value: string): Date | null {
  if (!isValidLocalDate(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) return null;
  return new Date(year, month - 1, day, 12);
}

export function formatLocalDate(
  value: string,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  },
): string {
  const date = parseLocalDate(value);
  return date ? new Intl.DateTimeFormat(undefined, options).format(date) : 'No date';
}

export function isDateBefore(value: string, reference = localDateNow()): boolean {
  return isValidLocalDate(value) && value < reference;
}

export function isDateAfter(value: string, reference = localDateNow()): boolean {
  return isValidLocalDate(value) && value > reference;
}

export function isSameLocalDay(timestamp: string, reference = localDateNow()): boolean {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return false;
  return localDateOffset(0, date) === reference;
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    date,
  );
}

export function timestampAgo(now: Date, minutesAgo: number): string {
  return new Date(now.getTime() - minutesAgo * 60_000).toISOString();
}
