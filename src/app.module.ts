import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { SeedModule } from './infrastructure/seed/seed.module';
import { PersistenceModule } from './modules/persistence.module';
import { RealtimeModule } from './realtime/reltime.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SeedModule,
    InfrastructureModule,
    PersistenceModule,
    RealtimeModule,
  ],
})
export class AppModule {}
