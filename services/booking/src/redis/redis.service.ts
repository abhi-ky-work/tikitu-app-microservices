import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType | null = null;
  private readonly enabled = process.env.REDIS_ENABLED !== 'false';

  async onModuleInit() {
    if (!this.enabled) {
      this.logger.warn('Redis disabled (REDIS_ENABLED=false)');
      return;
    }

    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = createClient({ url });

    this.client.on('error', (err) => this.logger.error('Redis error', err));

    try {
      await this.client.connect();
      this.logger.log('Redis connected');
    } catch (err) {
      this.logger.warn('Redis unavailable — cache disabled', err);
      this.client = null;
    }
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client?.isOpen) return null;
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.client?.isOpen) return;
    await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  }

  async del(key: string): Promise<void> {
    if (!this.client?.isOpen) return;
    await this.client.del(key);
  }

  cacheKey(prefix: string, parts: Record<string, string | undefined>): string {
    const segment = Object.entries(parts)
      .filter(([, v]) => v)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return `tikitu:${prefix}:${segment}`;
  }
}
