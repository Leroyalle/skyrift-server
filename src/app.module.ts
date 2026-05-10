import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';

import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { PersistenceModule } from './modules/persistence.module';
import { RealtimeModule } from './realtime/reltime.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CqrsModule.forRoot(),
    InfrastructureModule,
    PersistenceModule,
    RealtimeModule,
  ],
})
export class AppModule {}
