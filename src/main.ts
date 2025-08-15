import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('start');
  app.use(cookieParser());
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.getOrThrow<string>('FRONTEND_URL'),
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
  });

  app.use('/assets', express.static(join(__dirname, '..', 'src/assets')));

  const port = configService.getOrThrow<number>('PORT') ?? 3001;
  console.log('PORT', port);
  await app.listen(port);
  console.log(
    `🚀 Server is running at http://localhost:${port}/graphql`,
    join(__dirname, '..', 'src/assets'),
  );
}
bootstrap();
