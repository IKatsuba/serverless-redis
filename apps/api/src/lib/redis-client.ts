import Redis from 'ioredis';

export class RedisClient {
  private redisClient: Redis | null = null;

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    const enableSSL = redisUrl.startsWith('rediss://');

    const redisClient = (this.redisClient = new Redis(redisUrl, {
      tls: enableSSL ? { rejectUnauthorized: false } : undefined,
    }));

    this.redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
      this.redisClient = null;
    });

    this.redisClient.on('connect', () => {
      this.redisClient = redisClient;
      console.log('Redis connected');
    });
  }

  async redisCommand(commandArray: string[]): Promise<any> {
    if (!this.redisClient) {
      throw new Error('Redis client is not connected');
    }

    try {
      const [command, ...args] = commandArray;

      const result = await this.redisClient.call(command, args);
      return { status: 'ok', result };
    } catch (error) {
      return { status: 'error', error: error.message };
    }
  }

  destroyRedis() {
    if (this.redisClient) {
      this.redisClient.disconnect();
      this.redisClient = null;
      console.log('Redis connection destroyed');
    }
  }
}

export const redisClient: RedisClient = new RedisClient();
