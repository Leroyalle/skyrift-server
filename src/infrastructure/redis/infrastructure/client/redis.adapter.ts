import Redis from 'ioredis';

import { Inject, Injectable } from '@nestjs/common';

import type { RedisAdapterPort } from '../../application/ports/redis-adapter.port';
import { REDIS_CLIENT_TOKEN } from '../../application/ports/tokens';

@Injectable()
export class RedisAdapter implements RedisAdapterPort {
  constructor(@Inject(REDIS_CLIENT_TOKEN) private readonly client: Redis) {
    this.client.on('connect', () => console.log('Connected to Redis'));
    this.client.on('error', err => console.error('Redis error:', err));
  }

  public async get<T = unknown>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  public async set(key: string, value: unknown): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }

  public async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  public async mget<T = unknown[]>(keys: string[]): Promise<(T | null)[]> {
    const data = await this.client.mget(keys);
    console.log('[redis service mget]', data);
    if (data) {
      // TODO: add try/catch
      return data.map(d => (d ? (JSON.parse(d) as T) : null));
    }
    return data;
  }

  public async sadd(key: string, value: string): Promise<void> {
    await this.client.sadd(key, value);
  }

  public async hset(key: string, value: Record<string, unknown>): Promise<void> {
    await this.client.hset(key, value);
  }

  public async smembers(key: string): Promise<string[]> {
    return await this.client.smembers(key);
  }

  public async srem(key: string, value: string): Promise<void> {
    await this.client.srem(key, value);
  }

  public async hgetAll(key: string): Promise<Record<string, string> | null> {
    return await this.client.hgetall(key);
  }

  public pipeline() {
    return this.client.pipeline();
  }

  public async lpush(key: string, data: unknown) {
    return await this.client.lpush(key, JSON.stringify(data));
  }

  public async ltrim(key: string, start: number, end: number) {
    return await this.client.ltrim(key, start, end);
  }

  public async lrange(key: string, start: number, end: number) {
    return await this.client.lrange(key, start, end);
  }
}
