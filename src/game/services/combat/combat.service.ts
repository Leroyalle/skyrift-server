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
import { getPendingActionKey } from 'src/game/lib/get-pending-action-key.lib';
import { ApplyAutoAttackResult } from 'src/game/types/attack/apply-auto-attack-result.type';
import { ApplySkillResult } from 'src/game/types/attack/apply-skill-result.type';
import { Socket } from 'socket.io';
import { RequestAttackMoveDto } from 'src/game/dto/request-attack-move.dto';
import { RequestSkillUseDto } from 'src/game/dto/request-use-skill.dto';
import { MovementService } from '../movement/movement.service';

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
  private readonly pendingActions: Map<string, PendingAction> = new Map();

  public async tickActions() {
    const updatesByLocation = new Map<string, BatchUpdateAction[]>();

    for (const action of this.pendingActions.values()) {
      const attacker = this.playerStateService.getCharacterState(
        action.attackerId,
      );

      const victim = this.playerStateService.getCharacterState(action.victimId);

      if (!attacker || !victim) return;

      const location = await this.locationService.loadLocation(
        attacker.locationId,
      );

      if (!location) return;

      const steps = await this.pathFindingService.getPlayerPath(
        attacker.locationId,
        {
          x: Math.floor(attacker.x / location.tileWidth),
          y: Math.floor(attacker.y / location.tileHeight),
        },
        {
          x: Math.floor(victim.x / location.tileWidth),
          y: Math.floor(victim.y / location.tileHeight),
        },
        location.tileWidth,
        location.passableMap,
      );

      const skill = attacker.characterSkills.find(
        (skill) => skill.id === action.skillId,
      );

      const range = skill ? skill.skill.range : attacker.attackRange;

      if (steps.length > range) {
        attacker.isAttacking = false;
        await this.schedulePathUpdate(
          attacker.id,
          victim.id,
          attacker.userId,
          action.skillId,
        );
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

      const attackerSocketId = this.socketService.getSocketId(attacker.userId);
      const victimSocketId = this.socketService.getSocketId(victim.userId);

      if (!attackerSocketId || !victimSocketId) return;

      const actionCtx: ActionContext = {
        attacker: { ...attacker, socketId: attackerSocketId },
        victim: { ...victim, socketId: victimSocketId },
        characterSkill: skill,
        batchLocation,
        now,
      };

      await this.resolveAction(actionCtx, action);
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

  public async requestAttackMove(client: Socket, input: RequestAttackMoveDto) {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      // FIXME: this.notifyDisconnection(client);
      client.disconnect();
      return;
    }

    const hasSubscribe = this.pendingActions.has(
      getPendingActionKey(
        client.userData.characterId,
        input.targetId,
        ActionType.AutoAttack,
      ),
    );

    if (hasSubscribe) return;

    await this.schedulePathUpdate(
      client.userData.characterId,
      input.targetId,
      client.userData.userId,
    );
  }

  public async requestUseSkill(client: Socket, input: RequestSkillUseDto) {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      // FIXME: this.notifyDisconnection(client);
      client.disconnect();
      return;
    }
    if (!input.targetId) return;
    const attacker = this.playerStateService.getCharacterState(
      client.userData.characterId,
    );

    const victim = this.playerStateService.getCharacterState(input.targetId);

    if (!attacker || !victim) return;

    const characterSkill = attacker.characterSkills.find(
      (skill) => skill.id === input.skillId,
    );

    if (!characterSkill) return;

    await this.schedulePathUpdate(
      attacker.id,
      victim.id,
      client.userData.userId,
      characterSkill.id,
    );
  }

  public requestAttackCancel(client: Socket, input: RequestAttackMoveDto) {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      client.disconnect();
      return;
    }

    const actionKeyAuto = getPendingActionKey(
      client.userData.characterId,
      input.targetId,
      ActionType.AutoAttack,
    );

    const actionKeySkill = getPendingActionKey(
      client.userData.characterId,
      input.targetId,
      ActionType.Skill,
    );

    if (this.pendingActions.has(actionKeyAuto)) {
      console.log('[request attack cancelled], delete action');
      this.pendingActions.delete(actionKeyAuto);
    }

    if (this.pendingActions.has(actionKeySkill)) {
      console.log('[request attack cancelled], delete action');
      this.pendingActions.delete(actionKeySkill);
    }
  }

  private async schedulePathUpdate(
    attackerId: string,
    targetId: string,
    attackerUserId: string,
    skillId: string | null = null,
  ) {
    const attacker = this.playerStateService.getCharacterState(attackerId);
    const target = this.playerStateService.getCharacterState(targetId);

    if (!attacker || !target || !target.isAlive) return;

    const characterSkill = attacker.characterSkills.find(
      (skill) => skill.id === skillId,
    );

    if (skillId && !characterSkill) {
      console.log(
        `Character ${attackerId} doesn't have skill ${skillId} to use`,
      );
      return;
    }

    if (characterSkill) {
      this.pendingActions.delete(
        getPendingActionKey(attackerId, targetId, ActionType.AutoAttack),
      );
      console.log('delete auto attack action');
    }

    attacker.currentTarget = {
      id: target.id,
      type: 'player',
    };

    const findLocation = await this.locationService.loadLocation(
      attacker.locationId,
    );

    if (!findLocation) return;

    const steps = await this.pathFindingService.getPlayerPath(
      findLocation.id,
      {
        x: Math.floor(attacker.x / findLocation.tileWidth),
        y: Math.floor(attacker.y / findLocation.tileHeight),
      },
      {
        x: Math.floor(target.x / findLocation.tileWidth),
        y: Math.floor(target.y / findLocation.tileHeight),
      },
      findLocation.tileWidth,
      findLocation.passableMap,
    );

    if (steps.length === -1) return;

    const range = characterSkill
      ? characterSkill.skill.range
      : attacker.attackRange;

    console.log('range:', range);

    const actionType = skillId ? ActionType.Skill : ActionType.AutoAttack;
    if (steps.length <= range) {
      this.pendingActions.set(
        getPendingActionKey(attacker.id, target.id, actionType),
        {
          attackerId: attacker.id,
          victimId: target.id,
          actionType,
          state: 'attack',
          skillId,
        },
      );

      console.log('steps length <= range, set attack action');

      return;
    }

    this.movementService.setMovementQueue(attacker.id, {
      steps: steps.slice(0, steps.length - range),
      userId: attackerUserId,
    });

    this.pendingActions.set(
      getPendingActionKey(attacker.id, target.id, actionType),
      {
        attackerId: attacker.id,
        victimId: target.id,
        actionType,
        state: 'move-to-target',
        skillId,
      },
    );

    console.log('steps length > range, set move-to-target action');
  }

  async resolveAction(
    ctx: ActionContext,
    action: PendingAction,
  ): Promise<void> {
    switch (action.actionType) {
      case ActionType.AutoAttack: {
        if (ctx.now - ctx.attacker.lastAttackAt < ctx.attacker.attackSpeed)
          return;

        const attackerDirection = getDirection(
          {
            x: ctx.attacker.x,
            y: ctx.attacker.y,
          },
          {
            x: ctx.victim.x,
            y: ctx.victim.y,
          },
        );

        this.socketService.sendTo(
          RedisKeys.Location + ctx.attacker.locationId,
          ServerToClientEvents.PlayerAttackStart,
          {
            attackerId: ctx.attacker.id,
            victimId: ctx.victim.id,
            actionType: ActionType.AutoAttack,
            skillId: action.skillId,
            attackerDirection,
          },
        );

        const attackResult = this.autoAttack(
          ctx.attacker.id,
          ctx.victim.id,
          ctx.now,
        );

        if (!attackResult) return;

        const { pendingActionKey: _, ...croppedAttackResult } = attackResult;

        ctx.batchLocation.push(croppedAttackResult);

        if (attackResult.pendingActionKey) {
          this.pendingActions.delete(attackResult.pendingActionKey);
        }

        break;
      }

      case ActionType.Skill: {
        if (!action.skillId || !ctx.characterSkill) return;

        // FIXME: мб удалить для того чтобы скилл юзался сразу
        if (ctx.now - ctx.attacker.lastAttackAt < ctx.attacker.attackSpeed)
          return;

        if ((ctx.characterSkill.cooldownEnd ?? 0) > ctx.now) return;

        const attackerDirection = getDirection(
          {
            x: ctx.attacker.x,
            y: ctx.attacker.y,
          },
          {
            x: ctx.victim.x,
            y: ctx.victim.y,
          },
        );

        const skillType = ctx.characterSkill.skill.type;

        if (skillType === SkillType.Target) {
          this.socketService.sendTo(
            RedisKeys.Location + ctx.attacker.locationId,
            ServerToClientEvents.PlayerAttackStart,
            {
              attackerId: ctx.attacker.id,
              victimId: ctx.victim.id,
              actionType: ActionType.Skill,
              skillId: action.skillId,
              attackerDirection,
            },
          );

          const applySkillResult = this.applySkill(
            ctx.attacker.id,
            ctx.victim.id,
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
        } else if (skillType === SkillType.AoE) {
          this.applyAoESkill();
        }

        this.pendingActions.delete(
          getPendingActionKey(
            ctx.attacker.id,
            ctx.victim.id,
            action.actionType,
          ),
        );

        await this.schedulePathUpdate(
          ctx.attacker.id,
          ctx.victim.id,
          ctx.attacker.userId,
          null,
        );

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
      pendingActionKey: !victim.isAlive
        ? getPendingActionKey(attacker.id, victim.id, ActionType.AutoAttack)
        : undefined,
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
