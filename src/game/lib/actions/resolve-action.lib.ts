import { LiveCharacter } from 'src/character/types/live-character-state.type';
import { BatchUpdateAction } from 'src/game/types/batch-update/batch-update-action.type';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';
import { TargetAction } from 'src/game/services/combat/types/target-action.type';

export type ActionContext = {
  attacker: LiveCharacter;
  target: TargetAction;
  characterSkill?: CharacterSkill;
  batchLocation: BatchUpdateAction[];
  now: number;
  tileSize: number;
  removeAction: () => void;
};

// export const resolveAction = async (
//   ctx: ActionContext,
//   action: PendingAction,
// ): Promise<void> => {
//   switch (action.actionType) {
//     case ActionType.AutoAttack: {
//       if (ctx.now - ctx.attacker.lastAttackAt < ctx.attacker.attackSpeed)
//         return;

//       const attackerDirection = getDirection(
//         {
//           x: ctx.attacker.x,
//           y: ctx.attacker.y,
//         },
//         {
//           x: ctx.victim.x,
//           y: ctx.victim.y,
//         },
//       );

//       ctx.server
//         .to(RedisKeys.Location + ctx.attacker.locationId)
//         .emit(ServerToClientEvents.PlayerAttackStart, {
//           attackerId: ctx.attacker.id,
//           victimId: ctx.victim.id,
//           actionType: ActionType.AutoAttack,
//           skillId: action.skillId,
//           attackerDirection,
//         });

//       const attackResult = ctx.autoAttackFn(
//         ctx.attacker.id,
//         ctx.victim.id,
//         ctx.now,
//       );

//       if (!attackResult) return;

//       const { pendingActionKey: _, ...croppedAttackResult } = attackResult;

//       ctx.batchLocation.push(croppedAttackResult);

//       if (attackResult.pendingActionKey) {
//         ctx.pendingActions.delete(attackResult.pendingActionKey);
//       }

//       break;
//     }

//     case ActionType.Skill: {
//       if (!action.skillId || !ctx.characterSkill) return;

//       if (ctx.now - ctx.attacker.lastAttackAt < ctx.attacker.attackSpeed)
//         return;

//       if ((ctx.characterSkill.cooldownEnd ?? 0) > ctx.now) return;

//       const attackerDirection = getDirection(
//         {
//           x: ctx.attacker.x,
//           y: ctx.attacker.y,
//         },
//         {
//           x: ctx.victim.x,
//           y: ctx.victim.y,
//         },
//       );

//       ctx.server
//         .to(RedisKeys.Location + ctx.attacker.locationId)
//         .emit(ServerToClientEvents.PlayerAttackStart, {
//           attackerId: ctx.attacker.id,
//           victimId: ctx.victim.id,
//           actionType: ActionType.Skill,
//           skillId: action.skillId,
//           attackerDirection,
//         });

//       const applySkillResult = ctx.applySkillFn(
//         ctx.attacker.id,
//         ctx.victim.id,
//         action.skillId,
//         ctx.now,
//       );

//       if (!applySkillResult) return;

//       ctx.batchLocation.push(applySkillResult.attackResult);

//       ctx.server
//         .to(ctx.attacker.socketId)
//         .emit(ServerToClientEvents.PlayerSkillCooldownUpdate, {
//           skillId: applySkillResult.cooldown.skillId,
//           cooldownEnd: applySkillResult.cooldown.cooldownEnd,
//         });

//       ctx.pendingActions.delete(
//         getPendingActionKey(ctx.attacker.id, ctx.victim.id, action.actionType),
//       );

//       await ctx.schedulePathUpdateFn(
//         ctx.attacker.id,
//         ctx.victim.id,
//         ctx.attacker.userId,
//         null,
//       );

//       break;
//     }
//   }
// };
