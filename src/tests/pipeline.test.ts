import { assertEquals } from '@std/assert';

import { testWithServer } from '../test-utils.ts';

testWithServer('pipeline: mixed commands', async ({ redis }) => {
  const p = redis.pipeline();
  p.set('k1', 'v1');
  p.set('k2', 'v2');
  p.get('k1');
  p.get('k2');
  p.incr('counter');
  p.incr('counter');
  const results = await p.exec();
  assertEquals(results, ['OK', 'OK', 'v1', 'v2', 1, 2]);
});

testWithServer('pipeline: empty exec is a no-op', async ({ redis }) => {
  const p = redis.pipeline();
  p.set('k', 'v');
  const results = await p.exec();
  assertEquals(results, ['OK']);
  assertEquals(await redis.get<string>('k'), 'v');
});

testWithServer('pipeline: hash commands', async ({ redis }) => {
  const p = redis.pipeline();
  p.hset('h', { a: 'alpha', b: 'beta' });
  p.hget('h', 'a');
  p.hlen('h');
  const results = await p.exec();
  assertEquals(results, [2, 'alpha', 2]);
});
