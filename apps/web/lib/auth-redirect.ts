export function safeAuthNext(value: string | null): string {
  return value?.startsWith("/") && !value.startsWith("//") && !/[\\\u0000-\u001f\u007f]/u.test(value)
    ? value
    : "/app/projects";
}
