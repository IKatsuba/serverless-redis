import { assertEquals } from '@std/assert';

import { rawCall, startTestServer } from '../test-utils.ts';

Deno.test({
  name: 'geo: GEOADD + GEOPOS round-trip',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const ctx = await startTestServer();
    try {
      const added = await rawCall(ctx, [
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

      const pos = (await rawCall(ctx, [
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
      await ctx.close();
    }
  },
});

Deno.test({
  name: 'geo: GEODIST returns a positive distance',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const ctx = await startTestServer();
    try {
      await rawCall(ctx, [
        'GEOADD',
        'places',
        '13.361389',
        '38.115556',
        'Palermo',
        '15.087269',
        '37.502669',
        'Catania',
      ]);
      const dist = await rawCall(ctx, [
        'GEODIST',
        'places',
        'Palermo',
        'Catania',
        'km',
      ]);
      assertEquals(Number(dist) > 100, true);
      assertEquals(Number(dist) < 200, true);
    } finally {
      await ctx.close();
    }
  },
});

Deno.test({
  name: 'geo: GEOSEARCH BYRADIUS finds members in range',
  sanitizeOps: false,
  sanitizeResources: false,
  fn: async () => {
    const ctx = await startTestServer();
    try {
      await rawCall(ctx, [
        'GEOADD',
        'places',
        '13.361389',
        '38.115556',
        'Palermo',
        '15.087269',
        '37.502669',
        'Catania',
      ]);
      const found = (await rawCall(ctx, [
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
      await ctx.close();
    }
  },
});
