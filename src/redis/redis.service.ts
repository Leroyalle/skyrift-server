import { Injectable, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private client: Redis) {
    this.client.on('connect', () => console.log('Connected to Redis'));
    this.client.on('error', (err) => console.error('Redis error:', err));
  }

  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async set(key: string, value: any): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async mget<T = any[]>(keys: string[]): Promise<(T | null)[]> {
    const data = await this.client.mget(keys);
    console.log('[redis service mget]', data);
    if (data) {
      // TODO: add try/catch
      return data.map((d) => (d ? (JSON.parse(d) as T) : null));
    }
    return data;
  }

  async sadd(key: string, value: string): Promise<void> {
    await this.client.sadd(key, value);
  }

  async hset(key: string, value: any): Promise<void> {
    await this.client.hset(key, value);
  }

  async smembers(key: string): Promise<string[]> {
    return await this.client.smembers(key);
  }
}
