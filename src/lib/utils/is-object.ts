export function isObject(obj: any) {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
}
