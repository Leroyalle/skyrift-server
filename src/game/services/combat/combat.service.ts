import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PlayerStateService } from '../player-state/player-state.service';
import { SkillType } from 'src/common/enums/skill/skill-type.enum';
import { PositionDto } from 'src/common/dto/position.dto';
import { SpatialGridService } from '../spatial-grid/spatial-grid.service';
import {
  LiveCharacter,
  TargetType,
} from 'src/character/types/live-character-state.type';
import { ActiveAoEZone } from './types/active-aoe-zone.type';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';
import { v4 as uuidv4 } from 'uuid';
import {
  BatchUpdateAction,
  Target,
} from 'src/game/types/batch-update/batch-update-action.type';
import { ActionType, PendingAction } from 'src/game/types/pending-actions.type';
import { LocationService } from 'src/location/location.service';
import { SocketService } from '../socket/socket.service';
import { ActionContext } from 'src/game/lib/actions/resolve-action.lib';
import { getDirection } from 'src/game/lib/get-direction.lib';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { ApplyAutoAttackResult } from 'src/game/types/attack/apply-auto-attack-result.type';
import {
  ApplySkillResult,
  CooldownResult,
} from 'src/game/types/attack/apply-skill-result.type';
import { Socket } from 'socket.io';
import { RequestAttackMoveDto } from 'src/game/dto/request-attack-move.dto';
import { RequestSkillUseDto } from 'src/game/dto/request-use-skill.dto';
import { MovementService } from '../movement/movement.service';
import { TargetAction } from './types/target-action.type';
import { CachedLocation } from 'src/location/types/cashed-location.type';
import { pushTargetAction } from './lib/push-target-action.lib';
import { PathFindingService } from '../path-finding/path-finding.service';
import { isEnemyFaction } from './lib/is-enemy-faction.lib';

@Injectable()
export class CombatService {
  constructor(
    private readonly playerStateService: PlayerStateService,
    private readonly spatialGridService: SpatialGridService<LiveCharacter>,
    private readonly pathFindingService: PathFindingService,
    private readonly locationService: LocationService,
    private readonly socketService: SocketService,
    @Inject(forwardRef(() => MovementService))
    private readonly movementService: MovementService,
  ) {}

  private readonly activeAoEZones: Map<string, ActiveAoEZone> = new Map();
  private readonly pendingActionsQueue: Map<string, PendingAction[]> =
    new Map();

  public async tickActions() {
    const updatesByLocation = new Map<string, BatchUpdateAction[]>();

    for (const queue of this.pendingActionsQueue.values()) {
      if (queue.length === 0) continue;
      console.log('queue', queue);
      const action = queue[0];
      console.log('action', action);

      const attacker = this.playerStateService.getCharacterState(
        action.attackerId,
      );

      if (!attacker) continue;
      const location = await this.locationService.loadLocation(
        attacker.locationId,
      );

      if (!location) continue;

      console.log('attackerPos', attacker.x, attacker.y);

      const attackerTile = {
        x: Math.floor(attacker.x / location.tileWidth),
        y: Math.floor(attacker.y / location.tileHeight),
      };

      let targetTile: { x: number; y: number } | null = null;

      if (action.target.kind === 'player') {
        const victim = this.playerStateService.getCharacterState(
          action.target.id,
        );
        if (!victim) continue;

        targetTile = {
          x: Math.floor(victim.x / location.tileWidth),
          y: Math.floor(victim.y / location.tileHeight),
        };
      } else if (action.target.kind === 'aoe') {
        targetTile = {
          x: Math.floor(action.target.x / location.tileWidth),
          y: Math.floor(action.target.y / location.tileHeight),
        };
      }

      if (!targetTile) continue;

      console.log('targetTile', targetTile);

      const steps = await this.pathFindingService.getPlayerPath(
        attacker.locationId,
        attackerTile,
        targetTile,
        location.tileWidth,
        location.passableMap,
      );

      const characterSkill = attacker.characterSkills.find(
        (skill) => skill.id === action.skillId,
      );

      const range = characterSkill
        ? characterSkill.skill.range
        : attacker.attackRange;

      if (steps.length > range) {
        attacker.isAttacking = false;
        this.movementService.setMovementQueue(attacker.id, {
          steps: steps.slice(0, steps.length - range),
          userId: attacker.userId,
        });
        continue;
      } else {
        attacker.isAttacking = true;
        this.movementService.deleteMovementQueue(attacker.id);
      }

      let batchLocation = updatesByLocation.get(location.id);
      if (!batchLocation) {
        batchLocation = [];
        updatesByLocation.set(location.id, batchLocation);
      }

      const now = Date.now();

      const actionCtx: ActionContext = {
        attacker,
        target: action.target,
        characterSkill: characterSkill,
        batchLocation,
        now,
        tileSize: location.tileWidth,
        removeAction: () => queue.shift(),
      };

      console.log('tick action', action);

      this.resolveAction(actionCtx, action);
    }

    for (const [locationId, update] of updatesByLocation.entries()) {
      this.socketService.sendTo(
        RedisKeys.Location + locationId,
        ServerToClientEvents.PlayerStateUpdate,
        update,
      );
    }
  }

  private despawnAoEZone(zone: ActiveAoEZone) {
    console.log('despawnAoEZone', zone);
    this.activeAoEZones.delete(zone.id);
    this.socketService.sendTo(
      RedisKeys.Location + zone.locationId,
      ServerToClientEvents.AoERemove,
      { id: zone.id },
    );
  }

  public tickAoE() {
    const updatesByLocation = new Map<string, BatchUpdateAction[]>();
    for (const zone of this.activeAoEZones.values()) {
      console.log('tickAoE', zone);
      const now = Date.now();

      if (now >= zone.expiresAt) {
        this.despawnAoEZone(zone);
        continue;
      }

      if (zone.lastUsedAt && now - zone.lastUsedAt <= 1000) continue;

      const attacker = this.playerStateService.getCharacterState(zone.casterId);
      if (!attacker) {
        this.despawnAoEZone(zone);
        continue;
      }

      const cSkill = attacker.characterSkills.find(
        (cSkill) => cSkill.id === zone.skillId,
      );

      if (!cSkill) {
        this.despawnAoEZone(zone);
        continue;
      }

      const { enemiesIds } = this.spatialGridService.queryRadius(
        zone.locationId,
        zone.x,
        zone.y,
        zone.radius,
      );

      let batchLocation = updatesByLocation.get(zone.locationId);
      if (!batchLocation) {
        batchLocation = [];
        updatesByLocation.set(zone.locationId, batchLocation);
      }

      const targets: Target[] = [];
      enemiesIds.forEach((id) => {
        const victim = this.playerStateService.getCharacterState(id);
        if (!victim || !cSkill.skill.damagePerSecond || !victim.isAlive) return;
        if (attacker.id === victim.id) return;
        const receivedDamage = cSkill.skill.damagePerSecond;
        const remainingHp = Math.max(victim.hp - receivedDamage, 0);
        victim.hp = remainingHp;
        victim.isAlive = remainingHp > 0;
        zone.lastUsedAt = now;
        targets.push({
          characterId: victim.id,
          hp: victim.hp,
          isAlive: victim.isAlive,
          receivedDamage,
        });

        console.log('TICK AOE', victim.name, receivedDamage);
      });

      batchLocation.push({
        targets,
        type: ActionType.Skill,
        skillId: cSkill.id,
      });
    }

    for (const [locationId, update] of updatesByLocation.entries()) {
      this.socketService.sendTo(
        RedisKeys.Location + locationId,
        ServerToClientEvents.PlayerStateUpdate,
        update,
      );
    }
  }

  private getOrCreateActionQueue(characterId: string) {
    let queue = this.pendingActionsQueue.get(characterId);
    if (!queue) {
      queue = [];
      this.pendingActionsQueue.set(characterId, queue);
    }
    return queue;
  }

  public getActiveAoeZones(locationId: string) {
    return Array.from(this.activeAoEZones.values()).filter(
      (zone) => zone.locationId === locationId,
    );
  }

  public async requestAttackMove(client: Socket, input: RequestAttackMoveDto) {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }

    const attacker = this.playerStateService.getCharacterState(
      client.userData.characterId,
    );

    if (!attacker) return;

    const victim = this.playerStateService.getCharacterState(input.targetId);

    if (!victim) return;

    const attackerFactionName = attacker.characterClass.faction.name;
    const victimFactionName = victim.characterClass.faction.name;

    if (!isEnemyFaction(attackerFactionName, victimFactionName)) return;

    const queue = this.getOrCreateActionQueue(attacker.id);

    const hasAutoAttack = queue.some(
      (q) => q.actionType === ActionType.AutoAttack,
    );

    if (hasAutoAttack) return;

    console.log('hasAutoAttack', hasAutoAttack);

    const pendingAction: PendingAction = {
      actionType: ActionType.AutoAttack,
      attackerId: client.userData.characterId,
      target: {
        kind: 'player',
        id: input.targetId,
      },
      skillId: null,
      state: 'attack',
    };

    await this.schedulePathUpdate(
      attacker,
      {
        kind: 'player',
        id: input.targetId,
      },
      null,
    );
    console.log('queue request auto attack', queue, pendingAction);
  }

  public async requestUseSkill(client: Socket, input: RequestSkillUseDto) {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }

    const attacker = this.playerStateService.getCharacterState(
      client.userData.characterId,
    );

    if (!attacker) return;

    const characterSkill = attacker.characterSkills.find(
      (skill) => skill.id === input.skillId,
    );

    if (!characterSkill) return;

    if (characterSkill.skill.type === SkillType.Target) {
      if (!input.targetId) return;

      const victim = this.playerStateService.getCharacterState(input.targetId);

      if (!victim) return;

      await this.schedulePathUpdate(
        attacker,
        {
          kind: 'player',
          id: input.targetId,
        },
        characterSkill.id,
      );
      return;
    } else if (characterSkill.skill.type === SkillType.AoE) {
      if (!input.area) return;

      await this.schedulePathUpdate(
        attacker,
        {
          kind: 'aoe',
          x: input.area.x,
          y: input.area.y,
        },
        characterSkill.id,
      );
      return;
    }
  }

  public requestAttackCancel(client: Socket) {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }

    this.pendingActionsQueue.set(client.userData.characterId, []);

    const attacker = this.playerStateService.getCharacterState(
      client.userData.characterId,
    );

    if (!attacker) return;

    attacker.currentTarget = null;
    attacker.isAttacking = false;
  }

  private resolveTarget(
    target: TargetAction,
    location: CachedLocation,
  ): {
    tile: { x: number; y: number };
    currentTarget: { id: string; type: TargetType } | null;
  } | null {
    if (target.kind === 'player') {
      const victim = this.playerStateService.getCharacterState(target.id);
      if (!victim || !victim.isAlive) return null;
      return {
        tile: {
          x: Math.floor(victim.x / location.tileWidth) | 0,
          y: Math.floor(victim.y / location.tileHeight) | 0,
        },
        currentTarget: { id: victim.id, type: target.kind },
      };
    }
    if (target.kind === 'aoe') {
      console.log('resolve target', {
        x: Math.floor(target.x / location.tileWidth) | 0,
        y: Math.floor(target.y / location.tileHeight) | 0,
      });
      return {
        tile: {
          x: Math.floor(target.x / location.tileWidth) | 0,
          y: Math.floor(target.y / location.tileHeight) | 0,
        },
        currentTarget: null,
      };
    }
    return null;
  }

  private async schedulePathUpdate(
    attacker: LiveCharacter,
    target: TargetAction,
    skillId: string | null = null,
  ) {
    const characterSkill = attacker.characterSkills.find(
      (skill) => skill.id === skillId,
    );

    if (skillId && !characterSkill) {
      console.log(
        `Character ${attacker.id} doesn't have skill ${skillId} to use`,
      );
      return;
    }

    const findLocation = await this.locationService.loadLocation(
      attacker.locationId,
    );

    if (!findLocation) return;

    const attackerTile = {
      x: Math.floor(attacker.x / findLocation.tileWidth),
      y: Math.floor(attacker.y / findLocation.tileHeight),
    };

    const result = this.resolveTarget(target, findLocation);

    if (!result) return;

    attacker.currentTarget = result.currentTarget;
    const targetTile = result.tile;

    const steps = await this.pathFindingService.getPlayerPath(
      findLocation.id,
      attackerTile,
      targetTile,
      findLocation.tileWidth,
      findLocation.passableMap,
    );

    if (steps.length === 0) return;

    const range = characterSkill
      ? characterSkill.skill.range
      : attacker.attackRange;

    const pendingAction: PendingAction = {
      actionType: skillId ? ActionType.Skill : ActionType.AutoAttack,
      attackerId: attacker.id,
      target,
      skillId,
      state: 'wait-path',
    };

    const queue = this.getOrCreateActionQueue(attacker.id);

    const hasAutoAttack = queue.some(
      (q) => q.actionType === ActionType.AutoAttack,
    );

    if (hasAutoAttack && !skillId) return;

    switch (characterSkill?.skill.type) {
      case SkillType.AoE: {
        this.resolvePendingActionState(attacker, pendingAction, range, steps);
        console.log('push aoe skill', pendingAction);
        pushTargetAction(queue, hasAutoAttack, pendingAction, characterSkill);
        break;
      }
      default: {
        this.resolvePendingActionState(attacker, pendingAction, range, steps);
        pushTargetAction(queue, hasAutoAttack, pendingAction, characterSkill);
        break;
      }
    }
  }

  private resolvePendingActionState(
    attacker: LiveCharacter,
    pendingAction: PendingAction,
    range: number,
    steps: PositionDto[],
  ) {
    const inRange = steps.length <= range;
    if (!inRange) {
      this.movementService.setMovementQueue(attacker.id, {
        steps: steps.slice(0, steps.length - range),
        userId: attacker.userId,
      });
      pendingAction.state = 'move-to-target';
      console.log('[resolve_pending_action]: SET STEPS');
    } else {
      pendingAction.state = 'attack';
      console.log('[resolve_pending_action]: attack');
    }
  }

  resolveAction(ctx: ActionContext, action: PendingAction): void {
    switch (action.actionType) {
      case ActionType.AutoAttack: {
        if (ctx.now - ctx.attacker.lastAttackAt < ctx.attacker.attackSpeed)
          return;

        if (action.target.kind !== 'player') return;

        const victim = this.playerStateService.getCharacterState(
          action.target.id,
        );

        if (!victim) return;

        const attackerDirection = getDirection(
          {
            x: ctx.attacker.x,
            y: ctx.attacker.y,
          },
          {
            x: victim.x,
            y: victim.y,
          },
        );

        this.socketService.sendTo(
          RedisKeys.Location + ctx.attacker.locationId,
          ServerToClientEvents.PlayerAttackStart,
          {
            attackerId: ctx.attacker.id,
            victimId: victim.id,
            actionType: ActionType.AutoAttack,
            skillId: action.skillId,
            attackerDirection,
          },
        );

        const attackResult = this.autoAttack(
          ctx.attacker.id,
          victim.id,
          ctx.now,
        );

        if (!attackResult) return;

        const { victimIsAlive, ...croppedAttackResult } = attackResult;

        ctx.batchLocation.push(croppedAttackResult);

        if (!victimIsAlive) {
          ctx.removeAction();
        }

        break;
      }

      case ActionType.Skill: {
        if (!action.skillId || !ctx.characterSkill) return;

        // FIXME: мб удалить для того чтобы скилл юзался сразу
        if (ctx.now - ctx.attacker.lastAttackAt < ctx.attacker.attackSpeed)
          return;

        if ((ctx.characterSkill.cooldownEnd ?? 0) > ctx.now) return;

        // FIXME: нужно передавать срразу тайлы либо локацию / тайлсайз
        const attackerTile = {
          x: Math.floor(ctx.attacker.x / ctx.tileSize),
          y: Math.floor(ctx.attacker.y / ctx.tileSize),
        };

        let targetTile: { x: number; y: number } | null = null;

        if (action.target.kind === 'player') {
          const victim = this.playerStateService.getCharacterState(
            action.target.id,
          );
          if (!victim || !victim.isAlive) return;
          targetTile = {
            x: Math.floor(victim.x / ctx.tileSize),
            y: Math.floor(victim.y / ctx.tileSize),
          };
        } else if (action.target.kind === 'aoe') {
          targetTile = {
            x: action.target.x,
            y: action.target.y,
          };
        }

        if (!targetTile) return;

        const attackerDirection = getDirection(attackerTile, targetTile);

        const skillType = ctx.characterSkill.skill.type;

        if (skillType === SkillType.Target && action.target.kind === 'player') {
          const victim = this.playerStateService.getCharacterState(
            action.target.id,
          );

          if (!victim) return;

          this.socketService.sendTo(
            RedisKeys.Location + ctx.attacker.locationId,
            ServerToClientEvents.PlayerAttackStart,
            {
              attackerId: ctx.attacker.id,
              victimId: victim.id,
              actionType: ActionType.Skill,
              skillId: action.skillId,
              attackerDirection,
            },
          );

          const applySkillResult = this.applySkill(
            ctx.attacker.id,
            victim.id,
            action.skillId,
            ctx.now,
          );

          if (!applySkillResult) return;

          ctx.batchLocation.push(applySkillResult.attackResult);

          this.sendUserSkillCooldown(
            ctx.attacker.userId,
            applySkillResult.cooldown,
          );
        } else if (
          skillType === SkillType.AoE &&
          action.target.kind === 'aoe'
        ) {
          const { kind: _, ...area } = action.target;
          const applyAoeSkillResult = this.applyAoESkill(
            action.attackerId,
            action.skillId,
            area,
          );
          if (!applyAoeSkillResult) return;
          this.sendUserSkillCooldown(
            ctx.attacker.userId,
            applyAoeSkillResult.cooldown,
          );
        }

        ctx.removeAction();

        break;
      }
    }
  }

  private sendUserSkillCooldown(userId: string, cooldown: CooldownResult) {
    this.socketService.sendToUser(
      userId,
      ServerToClientEvents.PlayerSkillCooldownUpdate,
      cooldown,
    );
  }

  public autoAttack(
    attackerId: string,
    victimId: string,
    now: number,
  ): ApplyAutoAttackResult | undefined {
    const attacker = this.playerStateService.getCharacterState(attackerId);
    const victim = this.playerStateService.getCharacterState(victimId);

    if (!attacker || !victim || attacker.locationId !== victim.locationId)
      return;

    // TODO: calculate received damage with defense and other stats
    const receivedDamage = attacker.basePhysicalDamage;
    console.log('receivedDamage', receivedDamage);
    const remainingHp = Math.max(victim.hp - receivedDamage, 0);
    const isAlive = remainingHp !== 0;

    victim.hp = remainingHp;
    victim.isAlive = isAlive;

    attacker.lastAttackAt = now;

    return {
      targets: [
        { characterId: victim.id, hp: remainingHp, isAlive, receivedDamage },
      ],
      type: ActionType.AutoAttack,
      skillId: null,
      victimIsAlive: victim.isAlive,
    };
  }

  public applySkill(
    attackerId: string,
    victimId: string,
    skillId: string,
    now: number,
  ): ApplySkillResult | undefined {
    const attacker = this.playerStateService.getCharacterState(attackerId);
    const victim = this.playerStateService.getCharacterState(victimId);

    if (!attacker || !victim || attacker.locationId !== victim.locationId)
      return;

    const characterSkill = attacker.characterSkills.find(
      (skill) => skill.id === skillId,
    );

    if (!characterSkill) return;

    // TODO: return message with time for cooldown
    if ((characterSkill.cooldownEnd ?? 0) > now) return;

    const receivedDamage = characterSkill.skill.damage;
    const remainingHp = Math.max(victim.hp - receivedDamage, 0);
    victim.hp = remainingHp;
    victim.isAlive = remainingHp > 0;

    characterSkill.lastUsedAt = now;
    characterSkill.cooldownEnd = now + characterSkill.skill.cooldownMs;

    attacker.lastAttackAt = now;

    return {
      attackResult: {
        targets: [
          {
            characterId: victim.id,
            hp: remainingHp,
            isAlive: remainingHp > 0,
            receivedDamage,
          },
        ],
        type: ActionType.Skill,
        skillId: characterSkill.id,
      },
      cooldown: {
        cooldownEnd: characterSkill.cooldownEnd,
        skillId: characterSkill.id,
      },
    };
  }

  applyAoESkill(
    attackerId: string,
    skillId: string,
    area: PositionDto,
  ): { cooldown: CooldownResult } | undefined {
    const attacker = this.playerStateService.getCharacterState(attackerId);
    if (!attacker) return;

    const characterSkill = attacker.characterSkills.find(
      (skill) => skill.id === skillId,
    );

    if (!characterSkill) return;

    console.log('applyAoESkill', characterSkill);

    const areaRadius = characterSkill.skill.areaRadius;

    if (characterSkill.skill.type !== SkillType.AoE || !areaRadius) return;

    console.log('BEFORE SPAWN AOE ZONE');

    const now = Date.now();

    this.spawnAoeZone(attacker, characterSkill, area, now);

    characterSkill.lastUsedAt = now;
    characterSkill.cooldownEnd = now + characterSkill.skill.cooldownMs;

    attacker.lastAttackAt = now;

    return {
      cooldown: {
        cooldownEnd: characterSkill.cooldownEnd,
        skillId: characterSkill.id,
      },
    };
    // TODO: characterSkill.skill.effects?.forEach((effect) => {
    //   if (effect.type === EffectType.DamageOverTime) {
    //   }
    // });
  }

  spawnAoeZone(
    caster: LiveCharacter,
    cSkill: CharacterSkill,
    area: PositionDto,
    now: number,
  ) {
    if (!cSkill.skill.areaRadius || !cSkill.skill.duration) return;

    console.log('spawn AOE zone');

    const zoneId = uuidv4() as string;
    this.activeAoEZones.set(zoneId, {
      id: zoneId,
      casterId: caster.id,
      locationId: caster.locationId,
      skillId: cSkill.id,
      radius: cSkill.skill.areaRadius,
      x: area.x,
      y: area.y,
      expiresAt: cSkill.skill.duration + now,
      effects: cSkill.skill.effects ?? [],
      lastUsedAt: null,
    });

    console.log('[spawnAoeZone] locationId', caster.locationId);

    this.socketService.sendTo(
      RedisKeys.Location + caster.locationId,
      ServerToClientEvents.AoESpawn,
      {
        id: zoneId,
        casterId: caster.id,
        skillId: cSkill.id,
        radius: cSkill.skill.areaRadius,
        x: area.x,
        y: area.y,
        expiresAt: cSkill.skill.duration + now,
      },
    );
  }
}
