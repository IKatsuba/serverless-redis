import { isObject } from './is-object.ts';

export function isResultArray(value: unknown) {
  return Array.isArray(value) && value.length && value.every(isObject);
}
