import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PlayerStateService } from '../player-state/player-state.service';
import { SkillType } from 'src/common/enums/skill/skill-type.enum';
import { PositionDto } from 'src/common/dto/position.dto';
import { BatchUpdateAction } from 'src/game/types/batch-update/batch-update-action.type';
import { ActionType, PendingAction } from 'src/game/types/pending-actions.type';
import { LocationService } from 'src/location/location.service';
import { SocketService } from '../socket/socket.service';
import { ActionContext } from 'src/game/lib/actions/resolve-action.lib';
import { getDirection } from 'src/game/lib/helpers/get-direction.lib';
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
import { PathFindingService } from '../path-finding/path-finding.service';
import { isEnemyFaction } from './lib/entity/guards/is-enemy-faction.lib';
import { EntityType } from 'src/game/types/entity/entity-type.type';
import { isPlayer } from './lib/entity/guards/is-player.lib';
import { findEntitySkill } from './lib/entity/helpers/get/find-entity-skill.lib';
import { RuntimeMobService } from '../runtime-mob/runtime-mob.service';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { AoeService } from './services/aoe/aoe.service';
import { RuntimeEntityService } from '../runtime-entity/runtime-entity.service';
import { ActionQueueService } from './services/action-queue/action-queue.service';
import { isMob } from './lib/entity/guards/is-mob.lib';
import { isArrowFlying } from './lib/helpers/is-arrow-flying';
import { ProjectileService } from './services/projectle/projectile.service';

@Injectable()
export class CombatService {
  constructor(
    private readonly playerStateService: PlayerStateService,
    private readonly pathFindingService: PathFindingService,
    private readonly locationService: LocationService,
    private readonly socketService: SocketService,
    @Inject(forwardRef(() => MovementService))
    private readonly movementService: MovementService,
    @Inject(forwardRef(() => RuntimeMobService))
    private readonly runtimeMobService: RuntimeMobService,
    private readonly aoeService: AoeService,
    private readonly runtimeEntityService: RuntimeEntityService,
    private readonly actionQueueService: ActionQueueService,
    private readonly projectileService: ProjectileService,
  ) {}

  public async tickActions(): Promise<void> {
    const updatesByLocation = new Map<string, BatchUpdateAction[]>();

    for (const queue of this.actionQueueService.getIterablePendingActions()) {
      if (queue.length === 0) continue;
      const action = queue[0];

      const attacker = this.runtimeEntityService.getEntityByType(
        action.attackerRef.type,
        action.attackerRef.id,
      );

      if (!attacker) continue;

      const location = await this.locationService.loadLocation(
        attacker.locationId,
      );

      if (!location) continue;

      const attackerTile = {
        x: Math.floor(attacker.x / location.tileWidth),
        y: Math.floor(attacker.y / location.tileHeight),
      };

      let targetTile: { x: number; y: number } | null = null;

      if (action.target.kind === 'target') {
        const victim = this.runtimeEntityService.getEntityByType(
          action.target.type,
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

      const steps = await this.pathFindingService.getPlayerPath(
        attacker.locationId,
        attackerTile,
        targetTile,
        location.passableMap,
      );

      if (!steps) {
        this.actionQueueService.clearPendingActions({
          type: attacker.type,
          id: attacker.id,
        });
        continue;
      }

      const entitySkill = findEntitySkill(attacker, action.skillId);

      const range = entitySkill
        ? entitySkill.skill.range
        : attacker.attackRange;

      if (steps.length > range) {
        this.movementService.setMovementQueue(attacker, steps);
        attacker.state = 'pursue';
        continue;
      } else {
        this.movementService.deleteMovementQueue(attacker);
        attacker.state = 'attack';
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
        characterSkill: entitySkill,
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

  public async requestAttackMoveForPlayer(
    client: Socket,
    input: RequestAttackMoveDto,
  ) {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }

    console.log('request attack move for player');

    const attacker = this.playerStateService.getCharacterState(
      client.userData.characterId,
    );

    if (!attacker) return;

    const victim = this.runtimeEntityService.getEntityByType(
      input.type,
      input.targetId,
    );

    if (!victim) return;

    await this.processAttackMove(attacker, victim);
  }

  public async requestAttackMoveForMob(
    runtimeMobId: string,
    characterId: string,
  ) {
    const attacker = this.runtimeMobService.getById(runtimeMobId);

    if (!attacker) return;

    const victim = this.playerStateService.getCharacterState(characterId);

    if (!victim) return;

    await this.processAttackMove(attacker, victim);
  }

  private async processAttackMove(
    attacker: TRuntimeEntity,
    victim: TRuntimeEntity,
  ) {
    if (isPlayer(attacker) && isPlayer(victim)) {
      const attackerFactionName = attacker.characterClass.faction.name;
      const victimFactionName = victim.characterClass.faction.name;

      if (!isEnemyFaction(attackerFactionName, victimFactionName)) return;
    }

    const hasAutoAttack = this.actionQueueService.findActionType(
      { id: attacker.id, type: attacker.type },
      ActionType.AutoAttack,
      { id: victim.id, type: victim.type, kind: 'target' },
    );

    console.log('hasAutoAttack', hasAutoAttack);

    if (hasAutoAttack) return;

    this.actionQueueService.clearPendingActions(attacker, []);

    await this.schedulePathUpdate(
      attacker,
      {
        kind: 'target',
        type: victim.type,
        id: victim.id,
      },
      null,
    );
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
      if (!input.targetRef) return;
      // FIXME: сделать универсальным и для мобов
      // const victim = this.playerStateService.getCharacterState(input.targetId);
      const victim = this.runtimeEntityService.getEntityByType(
        input.targetRef.type,
        input.targetRef.id,
      );

      if (!victim) return;

      await this.schedulePathUpdate(
        attacker,
        {
          kind: 'target',
          type: victim.type,
          id: victim.id,
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

  public requestAttackCancelForPlayer(client: Socket) {
    if (!this.socketService.verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }

    const { characterId } = client.userData;
    this.processRequestAttackCancel({ type: 'player', id: characterId });
  }

  public processRequestAttackCancel(ref: EntityRef) {
    const attacker = this.runtimeEntityService.getEntityByType(
      ref.type,
      ref.id,
    );

    if (!attacker) return;

    this.actionQueueService.clearPendingActions(
      { type: ref.type, id: ref.id },
      [],
    );
    attacker.state = 'idle';
    attacker.currentTarget = null;
    attacker.isAttacking = false;
  }

  private resolveTarget(
    target: TargetAction,
    location: CachedLocation,
  ): {
    tile: PositionDto;
    currentTarget: { id: string; type: EntityType } | null;
  } | null {
    if (target.kind === 'target') {
      const victim = this.runtimeEntityService.getEntityByType(
        target.type,
        target.id,
      );
      if (!victim || !victim.isAlive) return null;
      return {
        tile: {
          x: Math.floor(victim.x / location.tileWidth) | 0,
          y: Math.floor(victim.y / location.tileHeight) | 0,
        },
        currentTarget: { id: victim.id, type: target.type },
      };
    }
    if (target.kind === 'aoe') {
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
    attacker: TRuntimeEntity,
    target: TargetAction,
    skillId: string | null = null,
  ) {
    const attackerSkill = findEntitySkill(attacker, skillId);

    if (skillId && !attackerSkill) {
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

    // FIXME: объект передается не по ссылке, нужно получить атаккера и только потом менять таргет
    attacker.currentTarget = result.currentTarget;
    // attacker.currentTarget = target;

    const targetTile = result.tile;

    const steps = await this.pathFindingService.getPlayerPath(
      findLocation.id,
      attackerTile,
      targetTile,
      findLocation.passableMap,
    );

    console.log('schedulePathUpdate', steps);

    if (!steps) return;

    // FIXME: ниже????????
    if (steps.length === 0) return;

    const range = attackerSkill
      ? attackerSkill.skill.range
      : attacker.attackRange;

    const pendingAction: PendingAction = {
      actionType: skillId ? ActionType.Skill : ActionType.AutoAttack,
      attackerRef: {
        id: attacker.id,
        type: attacker.type,
      },
      target,
      skillId,
      state: 'wait-path',
      // attackInitiation: null,
    };

    const entityRef: EntityRef = {
      id: attacker.id,
      type: attacker.type,
    };
    switch (attackerSkill?.skill.type) {
      case SkillType.AoE: {
        this.resolvePendingActionState(attacker, pendingAction, range, steps);
        console.log('push aoe skill', pendingAction);
        this.actionQueueService.pushPendingAction(
          entityRef,
          pendingAction,
          attackerSkill,
        );
        break;
      }
      default: {
        this.resolvePendingActionState(attacker, pendingAction, range, steps);
        this.actionQueueService.pushPendingAction(
          entityRef,
          pendingAction,
          attackerSkill,
          target,
        );
        break;
      }
    }
  }

  private resolvePendingActionState(
    attacker: TRuntimeEntity,
    pendingAction: PendingAction,
    range: number,
    steps: PositionDto[],
  ) {
    const inRange = steps.length <= range;
    if (!inRange) {
      this.movementService.setMovementQueue(attacker, steps);
      // setEntityState<RuntimeEntity>(attacker, 'pursue');
      attacker.state = 'pursue';
      pendingAction.state = 'move-to-target';
      console.log('[resolve_pending_action]: SET STEPS');
    } else {
      pendingAction.state = 'attack';
      console.log('[resolve_pending_action]: attack');
    }
  }

  private resolveAction(ctx: ActionContext, action: PendingAction): void {
    switch (action.actionType) {
      case ActionType.AutoAttack: {
        if (ctx.now - ctx.attacker.lastAttackAt < ctx.attacker.attackSpeed)
          return;

        if (action.target.kind !== 'target') return;

        const victim = this.runtimeEntityService.getEntityByType(
          action.target.type,
          action.target.id,
        );

        if (!victim) return;

        this.startAttacking(ctx.attacker, victim, action);
        break;
        // обратно
        // const attackerDirection = getDirection(
        //   {
        //     x: ctx.attacker.x,
        //     y: ctx.attacker.y,
        //   },
        //   {
        //     x: victim.x,
        //     y: victim.y,
        //   },
        // );

        // const victimRef = {
        //   id: action.target.id,
        //   type: action.target.type,
        // };

        // this.applyMiniRoot(ctx.attacker, 200);

        // this.socketService.sendTo(
        //   RedisKeys.Location + ctx.attacker.locationId,
        //   ServerToClientEvents.EntityAttackStart,
        //   {
        //     attackerRef: {
        //       ...action.attackerRef,
        //       direction: attackerDirection,
        //     },
        //     victimRef,
        //     actionType: ActionType.AutoAttack,
        //     skillId: action.skillId,
        //   },
        // );

        // this.applyAction(ctx.attacker, victim, ctx.now, action);
        // const attackResult = this.autoAttack(
        //   action.attackerRef,
        //   victimRef,
        //   ctx.now,
        // );

        // if (!attackResult) return;

        // const { victimIsAlive, ...croppedAttackResult } = attackResult;

        // ctx.batchLocation.push(croppedAttackResult);

        // if (!victimIsAlive) {
        //   ctx.removeAction();
        // }
      }

      case ActionType.Skill: {
        if (!action.skillId || !ctx.characterSkill) return;
        // FIXME: мб удалить для того чтобы скилл юзался сразу
        if (ctx.now - ctx.attacker.lastAttackAt < ctx.attacker.attackSpeed)
          return;

        if ((ctx.characterSkill.cooldownEnd ?? 0) > ctx.now) return;

        // FIXME: нужно передавать сразу тайлы либо локацию / тайлсайз
        const attackerTile = {
          x: Math.floor(ctx.attacker.x / ctx.tileSize),
          y: Math.floor(ctx.attacker.y / ctx.tileSize),
        };

        let targetTile: { x: number; y: number } | null = null;
        let victim: TRuntimeEntity | undefined;
        if (action.target.kind === 'target') {
          victim = this.runtimeEntityService.getEntityByType(
            action.target.type,
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

        if (skillType === SkillType.Target && action.target.kind === 'target') {
          if (!victim) return;

          const attackerRef = {
            id: ctx.attacker.id,
            type: ctx.attacker.type,
          };

          const victimRef = {
            id: victim.id,
            type: victim.type,
          };

          this.socketService.sendTo(
            RedisKeys.Location + ctx.attacker.locationId,
            ServerToClientEvents.EntityAttackStart,
            {
              attackerRef: {
                ...attackerRef,
                direction: attackerDirection,
              },
              victimRef,
              actionType: ActionType.Skill,
              skillId: action.skillId,
            },
          );

          const applySkillResult = this.applySkill(
            attackerRef,
            victimRef,
            action.skillId,
            ctx.now,
          );

          if (!applySkillResult) return;

          ctx.batchLocation.push(applySkillResult.attackResult);

          // TODO: update set cooldown for mob & player
          if (isPlayer(ctx.attacker)) {
            this.sendUserSkillCooldown(
              ctx.attacker.userId,
              applySkillResult.cooldown,
            );
          }
        } else if (
          skillType === SkillType.AoE &&
          action.target.kind === 'aoe'
        ) {
          const { kind: _, ...area } = action.target;
          const applyAoeSkillResult = this.applyAoESkill(
            action.attackerRef.id,
            action.skillId,
            area,
          );
          if (!applyAoeSkillResult) return;

          this.actionQueueService.clearPendingActions(ctx.attacker, []);

          // TODO: update set cooldown for mob & player

          if (isPlayer(ctx.attacker)) {
            this.sendUserSkillCooldown(
              ctx.attacker.userId,
              applyAoeSkillResult.cooldown,
            );
          }
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

  private autoAttack(
    attackerRef: EntityRef,
    victimRef: EntityRef,
    now: number,
  ): ApplyAutoAttackResult | undefined {
    const attacker = this.runtimeEntityService.getEntityByType(
      attackerRef.type,
      attackerRef.id,
    );
    const victim = this.runtimeEntityService.getEntityByType(
      victimRef.type,
      victimRef.id,
    );

    if (!attacker) return;

    if (!victim || attacker.locationId !== victim.locationId) {
      attacker.currentTarget = null;
      attacker.state = 'idle';
      return;
    }

    const receivedDamage = attacker.basePhysicalDamage;
    console.log('receivedDamage', receivedDamage);
    const remainingHp = Math.max(victim.hp - receivedDamage, 0);
    const isAlive = remainingHp !== 0;
    this.applyMiniRoot(victim, 200, now);
    victim.hp = remainingHp;
    victim.isAlive = isAlive;

    if (isMob(victim)) {
      victim.aggro.updateThreatMap(attacker, receivedDamage);
      if (!victim.isAlive) {
        this.runtimeMobService.setRespawn(victim.id);
      }
    }

    attacker.lastAttackAt = now;

    const targets = [
      {
        id: victim.id,
        type: victim.type,
        hp: remainingHp,
        isAlive,
        receivedDamage,
      },
    ];

    return {
      targets,
      type: ActionType.AutoAttack,
      skillId: null,
      victimIsAlive: victim.isAlive,
    };
  }

  // private applyDamage(
  //   attacker: TRuntimeEntity,
  //   victim: TRuntimeEntity,
  //   now: number = Date.now(),
  // ) {
  //   const receivedDamage = attacker.basePhysicalDamage;
  //   console.log('receivedDamage', receivedDamage);
  //   const remainingHp = Math.max(victim.hp - receivedDamage, 0);
  //   const isAlive = remainingHp !== 0;
  //   this.applyMiniRoot(victim, 200, now);
  //   victim.hp = remainingHp;
  //   victim.isAlive = isAlive;

  //   return { attacker, victim };
  // }

  private applyMiniRoot(
    entity: TRuntimeEntity,
    rootTime: number = 200,
    now: number = Date.now(),
  ) {
    entity.lastMoveAt = now + rootTime;
  }

  private applySkill(
    attackerRef: EntityRef,
    victimRef: EntityRef,
    skillId: string,
    now: number,
  ): ApplySkillResult | undefined {
    // TODO: update for mob skills
    const attacker = this.playerStateService.getCharacterState(attackerRef.id);
    const victim = this.runtimeEntityService.getEntityByType(
      victimRef.type,
      victimRef.id,
    );

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

    if (victim.isAlive && victim.type === 'mob') {
      this.runtimeMobService.setRespawn(victim.id);
    }

    characterSkill.lastUsedAt = now;
    characterSkill.cooldownEnd = now + characterSkill.skill.cooldownMs;

    attacker.lastAttackAt = now;

    const targets = [
      {
        id: victim.id,
        type: victim.type,
        hp: remainingHp,
        isAlive: remainingHp > 0,
        receivedDamage,
      },
    ];

    return {
      attackResult: {
        targets,
        type: ActionType.Skill,
        skillId: characterSkill.id,
      },
      cooldown: {
        cooldownEnd: characterSkill.cooldownEnd,
        skillId: characterSkill.id,
      },
    };
  }

  // TODO: update for mobs
  private applyAoESkill(
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

    this.aoeService.spawnAoeZone(attacker, characterSkill, area, now);

    characterSkill.lastUsedAt = now;
    characterSkill.cooldownEnd = now + characterSkill.skill.cooldownMs;

    attacker.lastAttackAt = now;

    return {
      cooldown: {
        cooldownEnd: characterSkill.cooldownEnd,
        skillId: characterSkill.id,
      },
    };
  }

  private startAttacking(
    attacker: TRuntimeEntity,
    victim: TRuntimeEntity,
    action: PendingAction,
  ) {
    const attackerDirection = getDirection(
      {
        x: attacker.x,
        y: attacker.y,
      },
      {
        x: victim.x,
        y: victim.y,
      },
    );

    const attackerRef = {
      id: attacker.id,
      type: attacker.type,
    };
    const victimRef = {
      id: victim.id,
      type: victim.type,
    };

    this.applyMiniRoot(attacker, 200);

    this.socketService.sendTo(
      RedisKeys.Location + attacker.locationId,
      ServerToClientEvents.EntityAttackStart,
      {
        attackerRef: {
          ...attackerRef,
          direction: attackerDirection,
        },
        victimRef,
        actionType: ActionType.AutoAttack,
        skillId: action.skillId,
      },
    );

    this.projectileService.add(attackerRef, {
      victimRef,
      skillId: action.skillId,
      startedAt: Date.now(),
      startedTile: { x: attacker.x, y: attacker.y },
    });
  }

  private applyAction(
    attacker: EntityRef & PositionDto,
    victim: EntityRef & PositionDto,
    now: number,
    action: PendingAction,
  ) {
    if (
      isArrowFlying({ x: victim.x, y: victim.y }, 20, {
        startedAt: now,
        startedTile: { x: attacker.x, y: attacker.y },
      })
    )
      return;
    const attackResult = this.autoAttack(
      { id: attacker.id, type: attacker.type },
      { id: victim.id, type: victim.type },
      now,
    );
  }
}
