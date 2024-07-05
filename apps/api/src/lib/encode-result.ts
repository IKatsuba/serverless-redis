import { isObject } from './utils/is-object';

export function encodeResultValue(value: unknown): unknown {
  if (typeof value === 'number' || value === null) {
    return value;
  } else if (typeof value === 'string') {
    return Buffer.from(value).toString('base64');
  } else if (Array.isArray(value)) {
    return encodeResultValueList(value);
  } else {
    return value;
  }
}

export function encodeResultValueList(arr: unknown[]): unknown[] {
  return arr.map(encodeResult as any);
}

export function encodeResponseList(resultList: unknown[]): unknown[] {
  return resultList.map((entry) => {
    if ('result' in (entry as object)) {
      return {
        result: encodeResultValue((entry as { result: unknown }).result),
      };
    } else if ('error' in (entry as object)) {
      return { error: (entry as { error: string }).error };
    } else {
      return entry;
    }
  });
}

type ResultResponse =
  | { status: 'not_authorized'; message: string }
  | { status: 'redis_error'; error_result_map: Record<string, unknown> }
  | { status: 'connection_error'; error_result_map: Record<string, unknown> }
  | { status: 'ok'; result_list?: unknown[]; result?: unknown };

export function encodeResponse(response: ResultResponse): ResultResponse {
  switch (response?.status) {
    case 'ok':
      if (response.result_list) {
        return {
          ...response,
          result_list: encodeResponseList(response.result_list),
        };
      } else if (response.result) {
        return {
          ...response,
          result: encodeResultValue(response.result),
        };
      }

      return response;
    default:
      return response;
  }
}

export function encodeResult(result: { status: string; result: any } | null) {
  if (result === null || result === undefined) {
    return null;
  }

  if (!isObject(result)) {
    return encodeResultValue(result);
  }

  return {
    status: result.status,
    result: encodeResultValue(result.result),
  };
}
