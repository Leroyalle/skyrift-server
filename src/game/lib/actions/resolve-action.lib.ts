import { BatchUpdateAction } from 'src/game/types/batch-update/batch-update-action.type';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';
import { TargetAction } from 'src/game/services/combat/types/target-action.type';
import { WorldEntity } from 'src/game/types/entity/runtime-entity.type';

export type ActionContext = {
  attacker: WorldEntity;
  target: TargetAction;
  characterSkill?: CharacterSkill;
  batchLocation: BatchUpdateAction[];
  now: number;
  tileSize: number;
  removeAction: () => void;
};
