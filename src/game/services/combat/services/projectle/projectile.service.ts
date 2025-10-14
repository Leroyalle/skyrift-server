import { Injectable } from '@nestjs/common';
import { IProjectile } from './types/projectile.type';
import { EntityKey } from 'src/game/types/entity/keys/entity-key.type';
import { isArrowFlying } from '../../lib/helpers/is-arrow-flying';
import { RuntimeEntityService } from 'src/game/services/runtime-entity/runtime-entity.service';
import { decodeEntityKey } from 'src/game/lib/entity/decode-entity-key.lib';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { generateEntityKey } from 'src/game/lib/entity/generate-entity-key.lib';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { isMob } from '../../lib/entity/guards/is-mob.lib';
import { RuntimeMobService } from 'src/game/services/runtime-mob/runtime-mob.service';
import { ActionType } from 'src/game/types/pending-actions.type';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';
import { isPlayer } from '../../lib/entity/guards/is-player.lib';
import { SkillType } from 'src/common/enums/skill/skill-type.enum';
import { BatchUpdateAction } from 'src/game/types/batch-update/batch-update-action.type';
import { getOrCreateArray } from 'src/game/lib/helpers/get-or-create-array.lib';
import { SocketService } from 'src/game/services/socket/socket.service';
import { ActionQueueService } from '../action-queue/action-queue.service';

@Injectable()
export class ProjectileService {
  constructor(
    private readonly runtimeEntityService: RuntimeEntityService,
    private readonly runtimeMobService: RuntimeMobService,
    private readonly socketService: SocketService,
    private readonly actionQueueService: ActionQueueService,
  ) {}

  private readonly projectilesMap = new Map<EntityKey, IProjectile[]>();

  public tickProjectiles() {
    const updatesByLocation = new Map<string, BatchUpdateAction[]>();

    for (const [attackerKey, projectiles] of this.projectilesMap.entries()) {
      projectiles.forEach((projectile) => {
        const attackerRef = decodeEntityKey(attackerKey);
        const attacker = this.runtimeEntityService.getEntityByType(
          attackerRef.type,
          attackerRef.id,
        );

        const victim = this.runtimeEntityService.getEntityByType(
          projectile.victimRef.type,
          projectile.victimRef.id,
        );

        if (!attacker || !victim || attacker.locationId !== victim.locationId)
          return;

        const isAttackInProgress = isArrowFlying(
          { x: victim.x, y: victim.y },
          20,
          {
            startedAt: projectile.startedAt,
            startedTile: projectile.startedTile,
          },
        );

        if (isAttackInProgress) return;

        const result = this.applyProjectileAction(attackerRef, projectile);

        if (!result) return;

        // let batchLocation = updatesByLocation.get(attacker.id);
        // if (!batchLocation) {
        //   batchLocation = [];
        //   updatesByLocation.set(attacker.id, batchLocation);
        // }

        const batchLocation = getOrCreateArray(updatesByLocation, attacker.id);
        batchLocation.push(result);
      });
    }
  }

  public add(attackerRef: EntityRef, projectile: IProjectile) {
    const attackerKey = generateEntityKey(attackerRef);
    this.projectilesMap.set(attackerKey, [
      ...(this.projectilesMap.get(attackerKey) ?? []),
      projectile,
    ]);
  }

  private applyMiniRoot(
    entity: TRuntimeEntity,
    rootTime: number = 200,
    now: number = Date.now(),
  ) {
    entity.lastMoveAt = now + rootTime;
  }

  private applyProjectileAction(
    attackerRef: EntityRef,
    projectile: IProjectile,
  ): BatchUpdateAction | undefined {
    const attacker = this.runtimeEntityService.getEntityByType(
      attackerRef.type,
      attackerRef.id,
    );
    const victim = this.runtimeEntityService.getEntityByType(
      projectile.victimRef.type,
      projectile.victimRef.id,
    );

    if (!attacker) return;

    if (!victim || attacker.locationId !== victim.locationId) {
      attacker.currentTarget = null;
      attacker.state = 'idle';
      return;
    }

    const now = Date.now();

    let skill: CharacterSkill | undefined;

    if (isPlayer(attacker) && projectile.skillId) {
      skill = attacker.characterSkills.find(
        (skill) => skill.id === projectile.skillId,
      );
    }

    switch (skill?.skill.type) {
      case SkillType.Target: {
        const receivedDamage = skill.skill.damage;
        const remainingHp = this.updateHp(victim, -receivedDamage);
        if (isMob(victim)) victim.aggro.updateThreatMap(victim, receivedDamage);
        if (remainingHp <= 0) {
          this.actionQueueService.clearPendingActions(attackerRef, []);
        }
        this.applyMiniRoot(victim, 200, now);
        return {
          type: ActionType.Skill,
          skillId: skill.id,
          targets: [
            {
              id: victim.id,
              type: victim.type,
              receivedDamage,
              isAlive: remainingHp > 0,
              hp: remainingHp,
            },
          ],
        };
        // const remainingHp = Math.max(victim.hp - receivedDamage, 0);
        // victim.hp = remainingHp;
        // victim.isAlive = remainingHp > 0;
      }
      default: {
        const receivedDamage = attacker.basePhysicalDamage;
        const remainingHp = this.updateHp(victim, -receivedDamage);
        if (isMob(victim)) victim.aggro.updateThreatMap(victim, receivedDamage);
        if (remainingHp <= 0) {
          this.actionQueueService.clearPendingActions(attackerRef, []);
        }
        this.applyMiniRoot(victim, 200, now);
        return {
          type: ActionType.AutoAttack,
          skillId: null,
          targets: [
            {
              id: victim.id,
              type: victim.type,
              receivedDamage,
              isAlive: remainingHp > 0,
              hp: remainingHp,
            },
          ],
        };
      }
    }

    // const receivedDamage = attacker.basePhysicalDamage;
    // console.log('receivedDamage', receivedDamage);
    // const remainingHp = Math.max(victim.hp - receivedDamage, 0);
    // const isAlive = remainingHp !== 0;
    // this.applyMiniRoot(victim, 200, now);
    // victim.hp = remainingHp;
    // victim.isAlive = isAlive;

    // if (isMob(victim)) {
    //   victim.aggro.updateThreatMap(attacker, receivedDamage);
    //   if (!victim.isAlive) {
    //     this.runtimeMobService.setRespawn(victim.id);
    //   }
    // }

    // attacker.lastAttackAt = now;

    // const targets = [
    //   {
    //     id: victim.id,
    //     type: victim.type,
    //     hp: remainingHp,
    //     isAlive,
    //     receivedDamage,
    //   },
    // ];

    // return {
    //   targets,
    //   type: ActionType.AutoAttack,
    //   skillId: null,
    //   victimIsAlive: victim.isAlive,
    // };
  }

  private updateHp(victim: TRuntimeEntity, delta: number): number {
    const remainingHp = Math.max(Math.min(victim.hp + delta, victim.maxHp), 0);
    victim.hp = remainingHp;
    victim.isAlive = remainingHp > 0;
    return remainingHp;
  }
}
