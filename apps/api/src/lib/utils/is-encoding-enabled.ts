import { HonoRequest } from 'hono';

export function isEncodingEnabled(req: HonoRequest) {
  const encodingHeader = req.header('upstash-encoding');

  return !!encodingHeader && encodingHeader === 'base64';
}
