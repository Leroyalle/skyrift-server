import { Injectable } from '@nestjs/common';
import { PlayerStateService } from '../../player-state.service';
import { SkillType } from 'src/common/enums/skill/skill-type.enum';
import { PositionDto } from 'src/common/dto/position.dto';
import { SpatialGridService } from '../spatial-grid/spatial-grid.service';
import { LiveCharacterState } from 'src/character/types/live-character-state.type';
import { ActiveAoEZone } from './types/active-aoe-zone.type';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';
import { v4 as uuidv4 } from 'uuid';
import { EffectType } from 'src/common/enums/skill/effect-type.enum';
import {
  BatchUpdateAction,
  Target,
} from 'src/game/types/batch-update/batch-update-action.type';
import { ActionType, PendingAction } from 'src/game/types/pending-actions.type';
import { PathFindingService } from 'src/game/path-finding/path-finding.service';
import { LocationService } from 'src/location/location.service';
import { SocketService } from '../socket/socket.service';
import { ActionContext } from 'src/game/lib/actions/resolve-action.lib';
import { getDirection } from 'src/game/lib/get-direction.lib';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { ApplyAutoAttackResult } from 'src/game/types/attack/apply-auto-attack-result.type';
import { ApplySkillResult } from 'src/game/types/attack/apply-skill-result.type';
import { Socket } from 'socket.io';
import { RequestAttackMoveDto } from 'src/game/dto/request-attack-move.dto';
import { RequestSkillUseDto } from 'src/game/dto/request-use-skill.dto';
import { MovementService } from '../movement/movement.service';
import { TargetAction } from './types/target-action.type';

@Injectable()
export class CombatService {
  constructor(
    private readonly playerStateService: PlayerStateService,
    private readonly spatialGridService: SpatialGridService<LiveCharacterState>,
    private readonly pathFindingService: PathFindingService,
    private readonly locationService: LocationService,
    private readonly socketService: SocketService,
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
        // if (action.target.kind === 'player') {
        //   const victim = this.playerStateService.getCharacterState(
        //     action.target.id,
        //   );
        //   if (!victim) continue;

        this.movementService.setMovementQueue(attacker.id, {
          steps: steps.slice(0, steps.length - range),
          userId: attacker.userId,
        });
        // await this.schedulePathUpdate(
        //   attacker,
        //   {
        //     kind: 'player',
        //     id: victim.id,
        //   },
        //   characterSkill?.id,
        // );
        // } else if (action.target.kind === 'aoe') {
        //   await this.schedulePathUpdate(
        //     attacker,
        //     {
        //       kind: 'aoe',
        //       ...targetTile,
        //     },
        //     characterSkill?.id,
        //   );
        // }
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

  public tickAoE() {
    const updatesByLocation = new Map<string, BatchUpdateAction[]>();

    for (const zone of this.activeAoEZones.values()) {
      const now = Date.now();
      if (zone.expiresAt > now) {
        this.activeAoEZones.delete(zone.id);
        return;
      }

      if (!zone.lastUsedAt || now - zone.lastUsedAt <= 1000) return;

      const attacker = this.playerStateService.getCharacterState(zone.casterId);
      if (!attacker) {
        this.activeAoEZones.delete(zone.id);
        return;
      }

      const cSkill = attacker.characterSkills.find(
        (cSkill) => cSkill.id === zone.skillId,
      );
      if (!cSkill) {
        this.activeAoEZones.delete(zone.id);
        return;
      }

      const victimsIds = this.spatialGridService.queryRadius(
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
      victimsIds.forEach((id) => {
        const victim = this.playerStateService.getCharacterState(id);
        if (!victim || !cSkill.skill.damagePerSecond) return;
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

    // queue.push(pendingAction);
    await this.schedulePathUpdate(
      attacker,
      {
        kind: 'player',
        id: input.targetId,
      },
      null,
    );
    console.log('queue request auto attack', queue, pendingAction);
    // FIXME:
    // await this.schedulePathUpdate(
    //   client.userData.characterId,
    //   input.targetId,
    //   client.userData.userId,
    // );
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

  public requestAttackCancel(client: Socket, input: RequestAttackMoveDto) {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }

    this.pendingActionsQueue.set(client.userData.characterId, []);
  }

  private async schedulePathUpdate(
    attacker: LiveCharacterState,
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

    let targetTile: { x: number; y: number } | null = null;

    if (target.kind === 'player') {
      const victim = this.playerStateService.getCharacterState(target.id);
      if (!victim || !victim.isAlive) return;

      attacker.currentTarget = {
        id: victim.id,
        type: target.kind,
      };

      targetTile = {
        x: Math.floor(victim.x / findLocation.tileWidth),
        y: Math.floor(victim.y / findLocation.tileHeight),
      };
    } else if (target.kind === 'aoe') {
      attacker.currentTarget = null;
      targetTile = {
        x: Math.floor(target.x / findLocation.tileWidth),
        y: Math.floor(target.y / findLocation.tileHeight),
      };
    }

    if (!targetTile) return;

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

    const autoAttackAction: PendingAction = {
      ...pendingAction,
      actionType: ActionType.AutoAttack,
      skillId: null,
    };

    const queue = this.getOrCreateActionQueue(attacker.id);

    const hasAutoAttack = queue.some(
      (q) => q.actionType === ActionType.AutoAttack,
    );

    if (steps.length <= range) {
      pendingAction.state = 'attack';

      if (hasAutoAttack && !skillId) return;

      if (hasAutoAttack) {
        queue.splice(-1, 0, pendingAction);
      } else {
        autoAttackAction.state = 'attack';
        queue.push(pendingAction, autoAttackAction);
      }

      console.log('steps length <= range, set attack action');

      return;
    }

    this.movementService.setMovementQueue(attacker.id, {
      steps: steps.slice(0, steps.length - range),
      userId: attacker.userId,
    });

    pendingAction.state = 'move-to-target';

    if (hasAutoAttack && !skillId) return;

    if (hasAutoAttack) {
      queue.splice(-1, 0, pendingAction);
    } else {
      autoAttackAction.state = 'move-to-target';
      queue.push(pendingAction, autoAttackAction);
    }

    console.log('steps length > range, set move-to-target action');
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

          this.socketService.sendToUser(
            ctx.attacker.userId,
            ServerToClientEvents.PlayerSkillCooldownUpdate,
            {
              skillId: applySkillResult.cooldown.skillId,
              cooldownEnd: applySkillResult.cooldown.cooldownEnd,
            },
          );
        } else if (
          skillType === SkillType.AoE &&
          action.target.kind === 'aoe'
        ) {
          const { kind: _, ...area } = action.target;
          this.applyAoESkill(action.attackerId, action.skillId, area);
        }

        ctx.removeAction();
        // this.pendingActions.delete(
        //   getTargetActionKey(ctx.attacker.id, ctx.victim.id, action.actionType),
        // );

        // await this.schedulePathUpdate(
        //   ctx.attacker.id,
        //   ctx.victim.id,
        //   ctx.attacker.userId,
        //   null,
        // );

        break;
      }
    }
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

  applyAoESkill(attackerId: string, skillId: string, area: PositionDto) {
    const attacker = this.playerStateService.getCharacterState(attackerId);
    if (!attacker) return;

    const characterSkill = attacker.characterSkills.find(
      (skill) => skill.id === skillId,
    );

    if (!characterSkill) return;

    const areaRadius = characterSkill.skill.areaRadius;

    if (characterSkill.skill.type !== SkillType.AoE || !areaRadius) return;

    characterSkill.skill.effects?.forEach((effect) => {
      if (effect.type === EffectType.DamageOverTime) {
        this.spawnAoeZone(attacker, characterSkill, area);
      }
    });
  }

  spawnAoeZone(
    caster: LiveCharacterState,
    cSkill: CharacterSkill,
    area: PositionDto,
  ) {
    if (!cSkill.skill.areaRadius || !cSkill.skill.duration) return;

    const now = Date.now();
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
  }
}
