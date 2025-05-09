import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.getOrThrow<string>('FRONTEND_URL'),
    credentials: true,
    exposedHeaders: ['Set-Cookie'],
  });

  await app.listen(configService.getOrThrow<number>('PORT') ?? 3001);
}
bootstrap();
