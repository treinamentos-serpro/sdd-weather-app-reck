const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'UTC',
  year: 'numeric',
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  hourCycle: 'h23',
  timeStyle: 'short',
  timeZone: 'UTC',
});

const NUMBER_FORMATTER = new Intl.NumberFormat('pt-BR');

function hasValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('pt-BR', { timeZone });
    return true;
  } catch {
    return false;
  }
}

function parseLocalDateTime(value: string): Date | null {
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?$/.exec(value);

  if (parts === null) {
    return null;
  }

  const [, yearPart, monthPart, dayPart, hourPart, minutePart, secondPart, fractionPart] = parts;
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  const second = Number(secondPart ?? '0');
  const millisecond = Number((fractionPart ?? '').padEnd(3, '0').slice(0, 3) || '0');
  const date = new Date(0);

  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, second, millisecond);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    date.getUTCHours() !== hour ||
    date.getUTCMinutes() !== minute ||
    date.getUTCSeconds() !== second
  ) {
    return null;
  }

  return date;
}

function parseLocalDate(value: string): Date | null {
  return parseLocalDateTime(`${value}T00:00`);
}

export function formatWeatherDateTime(
  localDateTime: string | null,
  timeZone: string,
): string | null {
  if (localDateTime === null || !hasValidTimeZone(timeZone)) {
    return null;
  }

  const date = parseLocalDateTime(localDateTime);
  return date === null ? null : DATE_TIME_FORMATTER.format(date);
}

export function formatWeatherDate(localDate: string | null, timeZone: string): string | null {
  if (localDate === null || !hasValidTimeZone(timeZone)) {
    return null;
  }

  const date = parseLocalDate(localDate);
  return date === null ? null : DATE_FORMATTER.format(date);
}

export function formatWeatherNumber(value: number | null): string | null {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  return NUMBER_FORMATTER.format(value);
}
