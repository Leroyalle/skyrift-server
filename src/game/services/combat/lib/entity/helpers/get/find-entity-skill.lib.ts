import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { isPlayer } from '../../guards/is-player.lib';

export function findEntitySkill(
  entity: TRuntimeEntity,
  skillId: string | null,
): CharacterSkill | undefined {
  if (isPlayer(entity)) {
    const entitySkill = entity.characterSkills.find(
      (skill) => skill.id === skillId,
    );

    return entitySkill;
  }
  return;
}
