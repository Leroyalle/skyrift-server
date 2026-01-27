import { CharacterSkill } from 'src/characters/character/character-skill/entities/character-skill.entity';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { SkillType } from 'src/common/enums/skill/skill-type.enum';
import { decodeEntityKey } from 'src/game/lib/entity/decode-entity-key.lib';
import { generateEntityKey } from 'src/game/lib/entity/generate-entity-key.lib';
import { getOrCreate } from 'src/game/lib/helpers/get-or-create-array.lib';
import { getTileByPosition } from 'src/game/lib/helpers/get-tile-by-position.lib';
import { RuntimeMobService } from 'src/game/services/characters/runtime-mob/runtime-mob.service';
import { EntityRegistryService } from 'src/game/services/entity-registry/entity-registry.service';
import { SocketService } from 'src/game/services/socket/socket.service';
import { BatchUpdateAction } from 'src/game/types/batch-update/batch-update-action.type';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { EntityKey } from 'src/game/types/entity/keys/entity-key.type';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { ActionType } from 'src/game/types/pending-actions.type';

import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { isMob } from '../../lib/entity/guards/is-mob.lib';
import { isPlayer } from '../../lib/entity/guards/is-player.lib';
import { isAttackInProgress } from '../../lib/helpers/is-attack-in-progress.lib';
import { ActionQueueService } from '../action-queue/action-queue.service';
import { CombatCalculationService } from '../combat-calculation/combat-calculation.service';

import { IProjectile } from './types/projectile.type';

@Injectable()
export class ProjectileService {
  constructor(
    private readonly registryService: EntityRegistryService,
    private readonly socketService: SocketService,
    private readonly actionQueueService: ActionQueueService,
    @Inject(forwardRef(() => RuntimeMobService))
    private readonly runtimeMobService: RuntimeMobService,
    private readonly combatCalculationService: CombatCalculationService,
  ) {}

  private readonly projectilesMap = new Map<EntityKey, Map<number, IProjectile>>();

  public tickProjectiles() {
    const updatesByLocation = new Map<string, BatchUpdateAction[]>();
    for (const [attackerKey, projectiles] of this.projectilesMap.entries()) {
      projectiles.forEach(projectile => {
        const attackerRef = decodeEntityKey(attackerKey);
        const attacker = this.registryService.getByRef(attackerRef);

        const victim = this.registryService.getByRef(projectile.victimRef);

        if (!attacker || !victim || attacker.locationId !== victim.locationId) return;

        const attackInProgress = isAttackInProgress(getTileByPosition(victim.x, victim.y), 100, {
          startedAt: projectile.startedAt,
          startedTile: projectile.startedTile,
        });
        if (attackInProgress) return;

        const result = this.applyProjectileAction(attackerRef, projectile);
        this.delete(attackerRef, projectile.startedAt);

        if (!result) return;

        const batchLocation = getOrCreate(updatesByLocation, attacker.locationId, () => []);
        batchLocation.push(result);
      });
    }

    for (const [locationId, batch] of updatesByLocation) {
      this.socketService.sendTo(
        RedisKeys.Location + locationId,
        ServerToClientEvents.EntityStateUpdate,
        batch,
      );
    }
  }

  public add(attackerRef: EntityRef, projectile: IProjectile) {
    const attackerKey = generateEntityKey(attackerRef);
    let projectilesMap = this.projectilesMap.get(attackerKey);
    if (!projectilesMap) {
      projectilesMap = new Map<number, IProjectile>();
      this.projectilesMap.set(attackerKey, projectilesMap);
    }
    projectilesMap.set(projectile.startedAt, projectile);
  }

  private delete(attackerRef: EntityRef, startedAt: number) {
    const attackerKey = generateEntityKey(attackerRef);
    const projectilesMap = this.projectilesMap.get(attackerKey);
    projectilesMap?.delete(startedAt);
  }

  private applyMiniRoot(entity: TRuntimeEntity, rootTime: number = 200, now: number = Date.now()) {
    entity.lastMoveAt = now + rootTime;
  }

  private applyProjectileAction(
    attackerRef: EntityRef,
    projectile: IProjectile,
  ): BatchUpdateAction | undefined {
    const attacker = this.registryService.getByRef(attackerRef);
    const victim = this.registryService.getByRef(projectile.victimRef);

    if (!attacker) return;

    if (!victim || attacker.locationId !== victim.locationId) {
      attacker.currentTarget = null;
      attacker.state = 'idle';
      return;
    }

    const now = Date.now();

    let skill: CharacterSkill | undefined;

    if (isPlayer(attacker) && projectile.skillId) {
      skill = attacker.characterSkills.find(skill => skill.id === projectile.skillId);
    }

    switch (skill?.skill.type) {
      case SkillType.Target: {
        const receivedDamage = skill.skill.damage;
        // const {} = this.combatCalculationService.calculateCombat({
        //   attacker,
        //   victim,
        //   source: ActionType.Skill,
        //   skill,
        // });

        const { remainingHp } = this.applyProjectile(attacker, victim, -receivedDamage);
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
      }
      default: {
        const receivedDamage = attacker.basePhysicalDamage;
        const { remainingHp } = this.applyProjectile(attacker, victim, -receivedDamage);
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
  }

  private applyProjectile(attacker: TRuntimeEntity, victim: TRuntimeEntity, hpValue: number) {
    const remainingHp = this.updateHp(victim, hpValue);
    if (isMob(victim)) {
      victim.aggro.updateThreatMap(attacker, Math.abs(hpValue));
    }
    if (remainingHp <= 0) {
      this.actionQueueService.clearPendingActions(attacker, []);
      if (isMob(victim)) {
        this.runtimeMobService.setRespawn(victim.id);
      }
    }
    return { remainingHp };
  }

  private updateHp(victim: TRuntimeEntity, delta: number): number {
    const remainingHp = Math.max(Math.min(victim.hp + delta, victim.maxHp), 0);
    victim.hp = remainingHp;
    victim.isAlive = remainingHp > 0;
    return remainingHp;
  }
}
