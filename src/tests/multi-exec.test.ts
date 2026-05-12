import { assertEquals } from '@std/assert';

import { testWithServer } from '../test-utils.ts';

testWithServer('multi-exec: basic transaction', async ({ redis }) => {
  const tx = redis.multi();
  tx.set('k', 'v');
  tx.get('k');
  tx.incr('counter');
  tx.incr('counter');
  const results = await tx.exec();
  assertEquals(results, ['OK', 'v', 1, 2]);
});

testWithServer('multi-exec: hash + list mixed', async ({ redis }) => {
  const tx = redis.multi();
  tx.hset('h', { a: 'alpha' });
  tx.hget('h', 'a');
  tx.rpush('l', 'x', 'y');
  tx.llen('l');
  const results = await tx.exec();
  assertEquals(results, [1, 'alpha', 2, 2]);
});
