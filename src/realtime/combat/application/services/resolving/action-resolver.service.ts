import { SOCKET_ADAPTER_TOKEN, type SocketAdapterPort } from 'src/infrastructure/ws';
import type { ActionQueueRepositoryPort } from 'src/realtime/combat/domain/ports/action-queue-repository.port';
import { RedisKeys } from 'src/realtime/contracts/constants/redis-keys.constant';
import { ServerToClientEvents } from 'src/realtime/contracts/constants/socket-events.constant';
import {
  ENTITY_ACTION_FACADE_TOKEN,
  ENTITY_RESOLVER_TOKEN,
  type EntityActionFacadePort,
  type EntityResolverPort,
  type EntitySnapshot,
} from 'src/realtime/entity-registry';
import { getTileByPosition } from 'src/realtime/shared/lib/helpers/get-tile-by-position.lib';

import { Inject, Injectable } from '@nestjs/common';

import type {
  ActionResolverPayload,
  ActionResolverServicePort,
} from '../../ports/action-resolver-service.port';
import { ACTION_QUEUE_REPOSITORY_TOKEN } from '../../ports/tokens';

import { AoESkillStarterService } from './aoe-skill-starter.service';
import { AttackStarterService } from './attack-starter.service';

@Injectable()
export class ActionResolverService implements ActionResolverServicePort {
  constructor(
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(ENTITY_ACTION_FACADE_TOKEN) private readonly entityActionFacade: EntityActionFacadePort,
    @Inject(ACTION_QUEUE_REPOSITORY_TOKEN)
    private readonly actionQueueRepository: ActionQueueRepositoryPort,
    private readonly attackStarterService: AttackStarterService,
    private readonly aoeSkillStarterService: AoESkillStarterService,
    @Inject(SOCKET_ADAPTER_TOKEN) private readonly socketAdapter: SocketAdapterPort,
  ) {}

  public execute(payload: ActionResolverPayload) {
    switch (payload.action.actionType) {
      case 'autoAttack': {
        if (payload.context.now - payload.attacker.lastAttackAt < payload.attacker.attackSpeed)
          return;

        if (payload.target.kind !== 'target') return;

        const victim = this.entityResolver.getByRef(payload.target.value);

        if (!victim || payload.attacker.position.locationId !== victim.position.locationId) {
          this.entityActionFacade.cancelAttack(payload.attacker);
          return;
        }

        const result = this.attackStarterService.execute({
          action: { skill: null, actionType: 'autoAttack' },
          attacker: payload.attacker,
          context: payload.context,
          victim: victim,
        });

        this.socketAdapter.sendTo(
          RedisKeys.Location + payload.attacker.position.locationId,
          ServerToClientEvents.EntityAttackStart,
          {
            attackerRef: result.attackerRef,
            victimRef: result.victimRef,
            actionType: result.actionType,
            skillId: result.skillId,
          },
        );
        break;
      }

      case 'skill': {
        if (!payload.action.skill) return;
        if (payload.context.now - payload.attacker.lastAttackAt < payload.attacker.attackSpeed) {
          return;
        }

        if ((payload.action.skill.cooldownEnd ?? 0) > payload.context.now) return;

        let targetTile: { x: number; y: number } | null = null;
        let victim: EntitySnapshot | null = null;

        if (payload.target.kind === 'target') {
          victim = this.entityResolver.getByRef(payload.target.value);
          if (!victim || !victim.combat.isAlive) return;
          targetTile = getTileByPosition(
            victim.position.x,
            victim.position.y,
            payload.context.tileSize,
          );
          // STOPPED: доделать возвраты у юзкейсов и тиков + эмиттинг, DI модули + auth (опционально)
          // TODO: мб удалить это, ведь ниже ветка обработки аое
        } else if (payload.target.kind === 'aoe') {
          targetTile = payload.target.value;
        }

        if (!targetTile) return;

        const skillType = payload.action.skill.type;

        if (skillType === 'Target' && payload.target.kind === 'target') {
          if (!victim) return;

          if (!victim || payload.attacker.position.locationId !== victim.position.locationId) {
            this.entityActionFacade.cancelAttack(payload.attacker);
            return;
          }

          const result = this.attackStarterService.execute({
            action: {
              skill: {
                cooldownEnd: payload.action.skill.cooldownEnd,
                cooldownMs: payload.action.skill.cooldownMs,
                id: payload.action.skill.id,
                lastUsedAt: payload.action.skill.lastUsedAt,
              },
              actionType: 'skill',
            },
            attacker: payload.attacker,
            context: payload.context,
            victim: victim,
          });

          this.socketAdapter.sendTo(
            RedisKeys.Location + payload.attacker.position.locationId,
            ServerToClientEvents.EntityAttackStart,
            {
              attackerRef: result.attackerRef,
              victimRef: result.victimRef,
              actionType: result.actionType,
              skillId: result.skillId,
            },
          );

          // this.startAttacking(payload.attacker, victim, action);
        } else if (skillType === 'AoE' && payload.target.kind === 'aoe') {
          const { kind: _, value } = payload.target;
          const result = this.aoeSkillStarterService.execute({
            area: value,
            skillId: payload.action.skill.id,
            attackerRef: payload.attacker,
            now: payload.context.now,
          });

          if (!result) return;

          if (payload.attacker.userId) {
            this.socketAdapter.sendToUser(
              payload.attacker.userId,
              ServerToClientEvents.PlayerSkillCooldownUpdate,
              result.cooldown,
            );
          }

          this.socketAdapter.sendTo(
            RedisKeys.Location + payload.attacker.position.locationId,
            ServerToClientEvents.AoESpawn,
            {
              id: result.zone.id,
              casterId: result.zone.casterRef.id,
              skillId: result.zone.skillId,
              radius: result.zone.radius,
              x: result.zone.x,
              y: result.zone.y,
              expiresAt: result.zone.expiresAt,
            },
          );

          this.actionQueueRepository.clear(payload.attacker);

          // FIXME: update set cooldown for mob & player
          // if (isPlayer(payload.attacker)) {
          //   this.sendUserSkillCooldown(payload.attacker.userId, applyAoeSkillResult.cooldown);
          // }
        }

        payload.context.removeAction();
        break;
      }
    }
  }
}
