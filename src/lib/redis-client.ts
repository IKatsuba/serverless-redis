import { Redis } from 'ioredis';

export class RedisClient {
  private redisClient: Redis | null = null;
  private idleTimer: number | null = null;
  private readonly redisUrl: string;
  private readonly enableSSL: boolean;
  private readonly idleTimeoutMs: number;

  constructor() {
    this.redisUrl = Deno.env.get('REDIS_URL') || 'redis://localhost:6379';
    this.enableSSL = this.redisUrl.startsWith('rediss://');
    this.idleTimeoutMs = Number(Deno.env.get('SR_IDLE_TIMEOUT_MS')) || 0;
  }

  private ensureConnected(): Redis {
    if (this.redisClient) {
      return this.redisClient;
    }

    const redisClient = new Redis(this.redisUrl, {
      lazyConnect: true,
      tls: this.enableSSL ? { rejectUnauthorized: false } : undefined,
    });

    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redisClient.on('connect', () => {
      console.log('Redis connected');
    });

    this.redisClient = redisClient;
    return redisClient;
  }

  private resetIdleTimer(): void {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }

    if (this.idleTimeoutMs > 0 && this.redisClient) {
      this.idleTimer = setTimeout(() => {
        this.destroyRedis();
      }, this.idleTimeoutMs);
    }
  }

  async redisCommand(commandArray: string[]): Promise<any> {
    const client = this.ensureConnected();

    try {
      const [command, ...args] = commandArray;

      const result = await client.call(command, args);
      return { status: 'ok', result };
    } catch (error) {
      return { status: 'error', error: (error as any).message };
    } finally {
      this.resetIdleTimer();
    }
  }

  destroyRedis() {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.redisClient) {
      this.redisClient.disconnect();
      this.redisClient = null;
      console.log('Redis connection destroyed');
    }
  }
}

export const redisClient: RedisClient = new RedisClient();
