import Redis from 'ioredis';

import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { REDIS_CLIENT_TOKEN } from '../../application/ports/tokens';

export const REDIS_CLIENT_CONFIG: Provider = {
  provide: REDIS_CLIENT_TOKEN,
  useFactory: (configService: ConfigService) => {
    return new Redis({
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
      password: configService.get('REDIS_PASSWORD'),
    });
  },
  inject: [ConfigService],
};
