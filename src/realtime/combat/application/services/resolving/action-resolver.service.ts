import type { ActionQueueRepositoryPort } from 'src/realtime/combat/domain/ports/action-queue-repository.port';
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

import type { AoESkillStarterService } from './aoe-skill-starter.service';
import type { AttackStarterService } from './attack-starter.service';

@Injectable()
export class ActionResolverService implements ActionResolverServicePort {
  constructor(
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(ENTITY_ACTION_FACADE_TOKEN) private readonly entityActionFacade: EntityActionFacadePort,
    @Inject(ACTION_QUEUE_REPOSITORY_TOKEN)
    private readonly actionQueueRepository: ActionQueueRepositoryPort,
    private readonly attackStarterService: AttackStarterService,
    private readonly aoeSkillStarterService: AoESkillStarterService,
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

        this.attackStarterService.execute({
          action: { skill: null, actionType: 'autoAttack' },
          attacker: payload.attacker,
          context: payload.context,
          victim: victim,
        });
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

          this.attackStarterService.execute({
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

          // this.startAttacking(payload.attacker, victim, action);
        } else if (skillType === 'AoE' && payload.target.kind === 'aoe') {
          const { kind: _, value } = payload.target;
          const applyAoeSkillResult = this.aoeSkillStarterService.execute({
            area: value,
            skillId: payload.action.skill.id,
            attackerRef: payload.attacker,
          });

          if (!applyAoeSkillResult) return;

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

  // public startAttacking(payload: StartAttackingPayload) {
  //   const attackerDirection = getDirection(payload.attacker.position, payload.victim.position);

  //   // const attackerRef = {
  //   //   id: attacker.id,
  //   //   type: attacker.type,
  //   // };
  //   // const victimRef = {
  //   //   id: victim.id,
  //   //   type: victim.type,
  //   // };
  //   // const now = Date.now();

  //   // TODO: фасад заюзать
  //   this.entityActionFacade.setLastAttackAt(payload.attacker, payload.context.now);

  //   if (payload.action.skill) {
  //     const cooldownEnd = payload.context.now + payload.action.skill.cooldownMs;
  //     payload.action.skill.lastUsedAt = payload.context.now;
  //     payload.action.skill.cooldownEnd = cooldownEnd;
  //     // TODO: формировать объект перезарядки
  //     // this.sendUserSkillCooldown(attacker.userId, {
  //     //   skillId: action.skillId,
  //     //   cooldownEnd,
  //     // });
  //   }

  //   // TODO: вынести в отдельную функцию
  //   // if (action.skillId && isPlayer(attacker)) {
  //   //   const cSkill = attacker.characterSkills.find(skill => skill.id === action.skillId);
  //   //   if (cSkill) {
  //   //     const cooldownEnd = now + cSkill.skill.cooldownMs;
  //   //     cSkill.lastUsedAt = now;
  //   //     cSkill.cooldownEnd = cooldownEnd;
  //   //     // TODO: мб слать кулдаун вместе с аттак стартед
  //   //     this.sendUserSkillCooldown(attacker.userId, {
  //   //       skillId: action.skillId,
  //   //       cooldownEnd,
  //   //     });
  //   //   }
  //   // }

  //   // this.applyMiniRoot(attacker);

  //   this.projectileService.add(attackerRef, {
  //     victimRef,
  //     skillId: action.skillId,
  //     startedAt: Date.now(),
  //     startedTile: getTileByPosition(attacker.x, attacker.y),
  //   });

  //   this.socketService.sendTo(
  //     RedisKeys.Location + attacker.locationId,
  //     ServerToClientEvents.EntityAttackStart,
  //     {
  //       attackerRef: {
  //         ...attackerRef,
  //         direction: attackerDirection,
  //       },
  //       victimRef,
  //       actionType: action.skillId ? ActionType.Skill : ActionType.AutoAttack,
  //       skillId: action.skillId,
  //     },
  //   );
  // }
}
