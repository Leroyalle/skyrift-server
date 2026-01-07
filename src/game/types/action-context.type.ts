import { CharacterSkill } from 'src/characters/character/character-skill/entities/character-skill.entity';
import { TargetAction } from 'src/game/services/combat/types/target-action.type';
import { BatchUpdateAction } from 'src/game/types/batch-update/batch-update-action.type';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';

export interface IActionContext {
  attacker: TRuntimeEntity;
  target: TargetAction;
  characterSkill?: CharacterSkill;
  batchLocation: BatchUpdateAction[];
  now: number;
  tileSize: number;
  removeAction: () => void;
}
