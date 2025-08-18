import { LiveCharacterState } from 'src/character/types/live-character-state.type';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { ActionType, PendingAction } from 'src/game/types/pending-actions.type';
import { Namespace } from 'socket.io';
import { BatchUpdateAction } from 'src/game/types/batch-update/batch-update-action.type';
import { getPendingActionKey } from '../get-pending-action-key';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';
import { ApplySkillResult } from 'src/game/types/attack/apply-skill-result.type';
import { ApplyAutoAttackResult } from 'src/game/types/attack/apply-auto-attack-result.type';
import { getDirection } from '../get-direction';

type LiveCharacterStateWithSocketId = LiveCharacterState & { socketId: string };

export type ActionContext = {
  server: Namespace;
  attacker: LiveCharacterStateWithSocketId;
  victim: LiveCharacterStateWithSocketId;
  characterSkill?: CharacterSkill;
  autoAttackFn: (
    attackerId: string,
    victimId: string,
    now: number,
  ) => ApplyAutoAttackResult | undefined;
  applySkillFn: (
    attackerId: string,
    victimId: string,
    skillId: string,
    now: number,
  ) => ApplySkillResult | undefined;
  schedulePathUpdateFn: (
    attackerId: string,
    targetId: string,
    attackerUserId: string,
    skillId: string | null,
  ) => Promise<void>;
  batchLocation: BatchUpdateAction[];
  pendingActions: Map<string, PendingAction>;
  now: number;
};

export const resolveAction = async (
  ctx: ActionContext,
  action: PendingAction,
): Promise<void> => {
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

      ctx.server
        .to(RedisKeys.Location + ctx.attacker.locationId)
        .emit(ServerToClientEvents.PlayerAttackStart, {
          attackerId: ctx.attacker.id,
          victimId: ctx.victim.id,
          actionType: ActionType.AutoAttack,
          skillId: action.skillId,
          attackerDirection,
        });

      const attackResult = ctx.autoAttackFn(
        ctx.attacker.id,
        ctx.victim.id,
        ctx.now,
      );

      if (!attackResult) return;

      const { pendingActionKey: _, ...croppedAttackResult } = attackResult;

      ctx.batchLocation.push(croppedAttackResult);

      if (attackResult.pendingActionKey) {
        ctx.pendingActions.delete(attackResult.pendingActionKey);
      }

      break;
    }

    case ActionType.Skill: {
      if (!action.skillId || !ctx.characterSkill) return;

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

      ctx.server
        .to(RedisKeys.Location + ctx.attacker.locationId)
        .emit(ServerToClientEvents.PlayerAttackStart, {
          attackerId: ctx.attacker.id,
          victimId: ctx.victim.id,
          actionType: ActionType.Skill,
          skillId: action.skillId,
          attackerDirection,
        });

      const applySkillResult = ctx.applySkillFn(
        ctx.attacker.id,
        ctx.victim.id,
        action.skillId,
        ctx.now,
      );

      if (!applySkillResult) return;

      ctx.batchLocation.push(applySkillResult.attackResult);

      // FIXME: чек удалить ли чарактер айди из возвррата потому что мы сами отправляем нужному клиенту его кулдаун
      ctx.server
        .to(ctx.attacker.socketId)
        .emit(ServerToClientEvents.PlayerSkillCooldownUpdate, {
          skillId: applySkillResult.cooldown.skillId,
          cooldownEnd: applySkillResult.cooldown.cooldownEnd,
        });

      ctx.pendingActions.delete(
        getPendingActionKey(ctx.attacker.id, ctx.victim.id, action.actionType),
      );

      await ctx.schedulePathUpdateFn(
        ctx.attacker.id,
        ctx.victim.id,
        ctx.attacker.userId,
        null,
      );

      break;
    }
  }
};
