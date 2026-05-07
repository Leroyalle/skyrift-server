import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { BOOTSTRAP_WORLD_USE_CASE_TOKEN, BootstrapWorldPort } from './realtime/flow';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.getOrThrow<string>('FRONTEND_URL'),
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
  });

  app.use('/assets', express.static(join(__dirname, '..', 'src/assets')));

  const port = config.getOrThrow<number>('PORT') ?? 3001;

  await app.init();

  const bootstrapWorldUseCase = app.get<BootstrapWorldPort>(BOOTSTRAP_WORLD_USE_CASE_TOKEN);
  await bootstrapWorldUseCase.execute();
  console.log('BOOTSTRAP COMPLETED');

  await app.listen(port);

  console.log(`🚀 Server is running at http://localhost:${port}`);
}
void bootstrap();
