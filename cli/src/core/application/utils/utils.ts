export function objectValues<T>(obj: Record<string, T>): T[] {
  return Object.keys(obj).map((key) => obj[key]);
}

export function objectEntries<T>(obj: Record<string, T>): [string, T][] {
  return Object.keys(obj).map((key) => [key, obj[key]]);
}
