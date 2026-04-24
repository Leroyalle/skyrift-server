import { Module } from '@nestjs/common';

import { MobSessionModule } from '../mob-session/mob-session.module';
import { NpcSessionModule } from '../npc-session/npc-session.module';
import { PlayerSessionModule } from '../player-session/player-session.module';

import { EntityActionFacade } from './application/facades/entity-action.facade';
import { ENTITY_ACTION_FACADE_TOKEN, ENTITY_RESOLVER_TOKEN } from './application/ports/tokens';
import { EntityResolver } from './application/resolvers/entity.resolver';

@Module({
  imports: [PlayerSessionModule, MobSessionModule, NpcSessionModule],
  providers: [
    {
      provide: ENTITY_RESOLVER_TOKEN,
      useClass: EntityResolver,
    },
    {
      provide: ENTITY_ACTION_FACADE_TOKEN,
      useClass: EntityActionFacade,
    },
  ],
  exports: [ENTITY_RESOLVER_TOKEN, ENTITY_ACTION_FACADE_TOKEN],
})
export class EntityRegistryModule {}
