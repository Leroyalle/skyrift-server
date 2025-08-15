import { LiveCharacterState } from 'src/character/types/live-character-state.type';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { ActionType, PendingAction } from 'src/game/types/pending-actions.type';
import { Namespace } from 'socket.io';
import { BatchUpdateAction } from 'src/game/types/batch-update/batch-update-action.type';
import { getPendingActionKey } from '../get-pending-action-key';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';

export type ActionContext = {
  server: Namespace;
  attacker: LiveCharacterState;
  victim: LiveCharacterState;
  characterSkill?: CharacterSkill;
  autoAttackFn: (
    attackerId: string,
    victimId: string,
    now: number,
  ) => BatchUpdateAction | undefined;
  applySkillFn: (
    attackerId: string,
    victimId: string,
    skillId: string,
    now: number,
  ) => BatchUpdateAction | undefined;
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
) => {
  switch (action.actionType) {
    case ActionType.AutoAttack: {
      if (ctx.now - ctx.attacker.lastAttackAt < ctx.attacker.attackSpeed)
        return;

      ctx.server
        .to(RedisKeys.Location + ctx.attacker.locationId)
        .emit(ServerToClientEvents.PlayerAttackStart, {
          attackerId: ctx.attacker.id,
          victimId: ctx.victim.id,
          actionType: ActionType.AutoAttack,
          skillId: action.skillId,
        });

      const attackResult = ctx.autoAttackFn(
        ctx.attacker.id,
        ctx.victim.id,
        ctx.now,
      );

      if (!attackResult) return;

      ctx.batchLocation.push(attackResult);

      if (!attackResult.isAlive) {
        ctx.pendingActions.delete(
          getPendingActionKey(
            ctx.attacker.id,
            ctx.victim.id,
            action.actionType,
          ),
        );
      }

      break;
    }

    case ActionType.Skill: {
      if (!action.skillId || !ctx.characterSkill) return;

      if (ctx.now - ctx.attacker.lastAttackAt < ctx.attacker.attackSpeed)
        return;

      if ((ctx.characterSkill.cooldownEnd ?? 0) > ctx.now) return;

      ctx.server
        .to(RedisKeys.Location + ctx.attacker.locationId)
        .emit(ServerToClientEvents.PlayerAttackStart, {
          attackerId: ctx.attacker.id,
          victimId: ctx.victim.id,
          actionType: ActionType.Skill,
          skillId: action.skillId,
        });

      const attackResult = ctx.applySkillFn(
        ctx.attacker.id,
        ctx.victim.id,
        action.skillId,
        ctx.now,
      );

      if (!attackResult) return;

      ctx.batchLocation.push(attackResult);

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
