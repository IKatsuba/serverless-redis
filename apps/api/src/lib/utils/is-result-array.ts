import { isObject } from './is-object';

export function isResultArray(value: unknown) {
  return Array.isArray(value) && value.length && value.every(isObject);
}
