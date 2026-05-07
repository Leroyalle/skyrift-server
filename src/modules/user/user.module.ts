import { CLOCK_TOKEN, SystemClockService } from 'src/realtime/shared/infrastructure/time';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserFacade } from './application/facade/user.facade';
import { USER_FACADE_TOKEN, USER_REPOSITORY_TOKEN } from './application/ports/tokens';
import { UserOrmEntity } from './infrastructure/persistence/entities/user-orm.entity';
import { UserRepository } from './infrastructure/persistence/repository/user.repository';
import { UserGraphqlController } from './presentation/user.graphql.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [
    UserGraphqlController,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: UserRepository,
    },
    {
      provide: USER_FACADE_TOKEN,
      useClass: UserFacade,
    },
    {
      provide: CLOCK_TOKEN,
      useClass: SystemClockService,
    },
  ],
  exports: [USER_FACADE_TOKEN],
})
export class UserModule {}
