import { isResultArray } from './utils/is-result-array';

export function responseFactory({
  status,
  result,
  error,
}: {
  status: string;
  result: unknown;
  error?: string;
}): Response {
  let code: number;
  let payload: unknown;

  switch (status) {
    case 'ok':
      code = 200;
      payload = isResultArray(result) ? result : { result: result };
      break;
    case 'not_found':
      code = 404;
      payload = { error };
      break;
    case 'malformed_data':
      code = 400;
      payload = { error };
      break;
    case 'redis_error':
    case 'error':
      code = 400;
      payload = { error };
      break;
    case 'not_authorized':
      code = 401;
      payload = { error };
      break;
    case 'connection_error':
      code = 500;
      payload = { error };
      break;
    default:
      code = 500;
      payload = { error: 'SRH: An error occurred internally' };
  }

  return Response.json(payload, {
    status: code,
  });
}
