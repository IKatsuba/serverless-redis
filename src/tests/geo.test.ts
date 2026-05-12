import { assertEquals } from '@std/assert';

import { startTestServer } from '../test-utils.ts';

async function call(
  url: string,
  token: string,
  command: (string | number)[],
): Promise<unknown> {
  const res = await fetch(`${url}/`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(command),
  });
  const body = await res.json();
  if (res.status !== 200) {
    throw new Error(`HTTP ${res.status}: ${body.error}`);
  }
  return body.result;
}

Deno.test({
  name: 'geo: GEOADD + GEOPOS round-trip',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      const added = await call(url, token, [
        'GEOADD',
        'places',
        '13.361389',
        '38.115556',
        'Palermo',
        '15.087269',
        '37.502669',
        'Catania',
      ]);
      assertEquals(added, 2);

      const pos = (await call(url, token, [
        'GEOPOS',
        'places',
        'Palermo',
        'Catania',
        'NonExistent',
      ])) as (string[] | null)[];
      assertEquals(pos.length, 3);
      assertEquals(pos[2], null);
      const palermoLon = Number(pos[0]![0]);
      assertEquals(Math.abs(palermoLon - 13.361389) < 0.01, true);
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: 'geo: GEODIST returns a positive distance',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      await call(url, token, [
        'GEOADD',
        'places',
        '13.361389',
        '38.115556',
        'Palermo',
        '15.087269',
        '37.502669',
        'Catania',
      ]);
      const dist = await call(url, token, [
        'GEODIST',
        'places',
        'Palermo',
        'Catania',
        'km',
      ]);
      assertEquals(Number(dist) > 100, true);
      assertEquals(Number(dist) < 200, true);
    } finally {
      await close();
    }
  },
});

Deno.test({
  name: 'geo: GEOSEARCH BYRADIUS finds members in range',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const { url, token, close } = await startTestServer();
    try {
      await call(url, token, [
        'GEOADD',
        'places',
        '13.361389',
        '38.115556',
        'Palermo',
        '15.087269',
        '37.502669',
        'Catania',
      ]);
      const found = (await call(url, token, [
        'GEOSEARCH',
        'places',
        'FROMLONLAT',
        '14.5',
        '37.8',
        'BYRADIUS',
        '200',
        'km',
        'ASC',
      ])) as string[];
      assertEquals(found.sort(), ['Catania', 'Palermo']);
    } finally {
      await close();
    }
  },
});
