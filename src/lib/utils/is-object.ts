export function isObject(obj: unknown) {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}
