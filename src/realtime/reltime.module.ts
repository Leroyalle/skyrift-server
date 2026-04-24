import { Module } from '@nestjs/common';

import { ChatModule } from './chat/chat.module';
import { CombatModule } from './combat/combat.module';
import { ConnectionStatsModule } from './connection-stats/connection-stats.module';
import { ContainerModule } from './container/container.module';
import { EffectModule } from './effect/effect.module';
import { EntityRegistryModule } from './entity-registry/entity-registry.module';
import { FactionModule } from './faction/faction.module';
import { FlowModule } from './flow/flow.module';
import { GatewayModule } from './gateway/gateway.module';
import { InteractionModule } from './interaction/interaction.module';
import { LocationModule } from './location/location.module';
import { MobSessionModule } from './mob-session/mob-session.module';
import { MovementModule } from './movement/movement.module';
import { NpcSessionModule } from './npc-session/npc-session.module';
import { PathFindingModule } from './path-finding/path-finding.module';
import { PlayerSessionModule } from './player-session/player-session.module';
import { PresenceModule } from './presence/presence.module';
import { QuestModule } from './quest/quest.module';
import { RecoveryModule } from './recovery/recovery.module';
import { SimulationModule } from './simulation/simulation.module';
import { SpatialGridModule } from './spatial-grid/spatial-grid.module';

@Module({
  imports: [
    ChatModule,
    CombatModule,
    ConnectionStatsModule,
    ContainerModule,
    EffectModule,
    EntityRegistryModule,
    FactionModule,
    FlowModule,
    GatewayModule,
    InteractionModule,
    LocationModule,
    MobSessionModule,
    MovementModule,
    NpcSessionModule,
    PathFindingModule,
    PlayerSessionModule,
    PresenceModule,
    QuestModule,
    RecoveryModule,
    SimulationModule,
    SpatialGridModule,
  ],
})
export class RealtimeModule {}
