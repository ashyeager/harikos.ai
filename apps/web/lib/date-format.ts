const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
};

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
};

export function formatUtcDateTime(value: string | Date): string {
  return `${new Intl.DateTimeFormat("en-US", DATE_TIME_OPTIONS).format(new Date(value))} UTC`;
}

export function formatUtcDate(value: string | Date): string {
  return new Intl.DateTimeFormat("en-US", DATE_OPTIONS).format(new Date(value));
}
