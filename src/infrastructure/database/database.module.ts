import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') as string,
        port: parseInt(configService.get('DB_PORT') as string, 10),
        username: configService.get('DB_USERNAME') as string,
        password: configService.get<string>('DB_PASSWORD') as string,
        database: configService.get('DB_DATABASE') as string,
        // ssl: {
        //   rejectUnauthorized: true,
        // },
        entities: [__dirname + '/../../**/*.entity.{ts,js}'],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
