import { assertEquals } from '@std/assert';
import { decodeBase64, encodeBase64 } from '@std/encoding/base64';

import { startTestServer } from '../test-utils.ts';

Deno.test({
  name: 'binary: round-trip non-printable bytes via Upstash-Encoding: base64',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      const bytes = new Uint8Array([
        0,
        1,
        2,
        10,
        13,
        127,
        128,
        200,
        255,
        0x7f,
        0xc3,
        0xa9,
      ]);

      const setRes = await fetch(`${url}/`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(['SET', 'bin', encodeBase64(bytes)]),
      });
      assertEquals(setRes.status, 200);
      await setRes.body?.cancel();

      const getRes = await fetch(`${url}/`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${token}`,
          'Upstash-Encoding': 'base64',
        },
        body: JSON.stringify(['GET', 'bin']),
      });
      const body = await getRes.json();
      const decodedTwice = decodeBase64(body.result);
      const expected = new TextEncoder().encode(encodeBase64(bytes));
      assertEquals(decodedTwice, expected);
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: 'binary: base64 pipeline preserves per-command result encoding',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      const value = 'hello\nworld\t!';
      const res = await fetch(`${url}/pipeline`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${token}`,
          'Upstash-Encoding': 'base64',
        },
        body: JSON.stringify([
          ['SET', 'k', value],
          ['GET', 'k'],
        ]),
      });
      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(Array.isArray(body), true);
      const decoded = new TextDecoder().decode(decodeBase64(body[1].result));
      assertEquals(decoded, value);
    } finally {
      await close();
    }
  },
});
