import { assertEquals } from '@std/assert';

import { testWithServer } from '../test-utils.ts';

testWithServer('strings: set/get/del', async ({ redis }) => {
  assertEquals(await redis.set('k', 'v'), 'OK');
  assertEquals(await redis.get<string>('k'), 'v');
  assertEquals(await redis.del('k'), 1);
  assertEquals(await redis.get('k'), null);
});

testWithServer('strings: incr/decr/incrby/decrby', async ({ redis }) => {
  assertEquals(await redis.incr('counter'), 1);
  assertEquals(await redis.incr('counter'), 2);
  assertEquals(await redis.incrby('counter', 5), 7);
  assertEquals(await redis.decr('counter'), 6);
  assertEquals(await redis.decrby('counter', 3), 3);
});

testWithServer('strings: append + strlen', async ({ redis }) => {
  assertEquals(await redis.append('k', 'hello'), 5);
  assertEquals(await redis.append('k', '-world'), 11);
  assertEquals(await redis.strlen('k'), 11);
  assertEquals(await redis.get<string>('k'), 'hello-world');
});

testWithServer('strings: getrange + setrange', async ({ redis }) => {
  await redis.set('k', 'hello world');
  assertEquals(await redis.getrange('k', 0, 4), 'hello');
  assertEquals(await redis.setrange('k', 6, 'there'), 11);
  assertEquals(await redis.get<string>('k'), 'hello there');
});

testWithServer('strings: mset + mget', async ({ redis }) => {
  await redis.mset({ a: 'alpha', b: 'beta', c: 'gamma' });
  assertEquals(await redis.mget<string[]>('a', 'b', 'c'), [
    'alpha',
    'beta',
    'gamma',
  ]);
  assertEquals(await redis.mget<(string | null)[]>('a', 'missing', 'c'), [
    'alpha',
    null,
    'gamma',
  ]);
});

testWithServer('strings: setex + ttl', async ({ redis }) => {
  await redis.setex('k', 60, 'v');
  assertEquals(await redis.get<string>('k'), 'v');
  const ttl = await redis.ttl('k');
  assertEquals(ttl > 0 && ttl <= 60, true);
});

testWithServer('strings: getset', async ({ redis }) => {
  await redis.set('k', 'old');
  assertEquals(await redis.getset('k', 'new'), 'old');
  assertEquals(await redis.get<string>('k'), 'new');
});

testWithServer('strings: incrbyfloat', async ({ redis }) => {
  await redis.set('k', '10.5');
  assertEquals(await redis.incrbyfloat('k', 0.5), 11);
});
