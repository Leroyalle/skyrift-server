import type Redis from 'ioredis';

export interface RedisAdapterPort {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  del(key: string): Promise<void>;

  mget<T = unknown>(keys: string[]): Promise<(T | null)[]>;

  sadd(key: string, value: string): Promise<void>;
  smembers(key: string): Promise<string[]>;
  srem(key: string, value: string): Promise<void>;

  hset(key: string, value: Record<string, unknown>): Promise<void>;
  hgetAll(key: string): Promise<Record<string, string> | null>;

  lpush(key: string, data: unknown): Promise<number>;
  ltrim(key: string, start: number, end: number): Promise<'OK'>;
  lrange(key: string, start: number, end: number): Promise<string[]>;

  pipeline(): ReturnType<Redis['pipeline']>;
}
