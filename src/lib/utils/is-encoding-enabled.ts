import type { HonoRequest } from 'npm:hono';

export function isEncodingEnabled(req: HonoRequest) {
  const encodingHeader = req.header('upstash-encoding');

  return !!encodingHeader && encodingHeader === 'base64';
}
