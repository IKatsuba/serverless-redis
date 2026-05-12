import { assertEquals } from '@std/assert';

import { testWithServer } from '../test-utils.ts';

testWithServer('server: ping', async ({ redis }) => {
  assertEquals(await redis.ping(), 'PONG');
});

testWithServer('server: echo', async ({ redis }) => {
  assertEquals(await redis.echo('hello'), 'hello');
});

testWithServer('server: dbsize after writes', async ({ redis }) => {
  await redis.mset({ a: '1', b: '2', c: '3' });
  assertEquals(await redis.dbsize(), 3);
});

testWithServer('server: flushdb', async ({ redis }) => {
  await redis.mset({ a: '1', b: '2' });
  await redis.flushdb();
  assertEquals(await redis.dbsize(), 0);
});

testWithServer('server: time', async ({ redis }) => {
  const [seconds, micros] = await redis.time();
  assertEquals(
    typeof seconds === 'string' || typeof seconds === 'number',
    true,
  );
  assertEquals(typeof micros === 'string' || typeof micros === 'number', true);
});
