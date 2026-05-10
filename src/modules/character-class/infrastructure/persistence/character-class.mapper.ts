import { CharacterClass } from '../../domain/entities/character-class.entity';
import { ClassDescriptionVo } from '../../domain/vo/class-description.vo';

import type { CharacterClassOrmEntity } from './character-class-orm.entity';

export class CharacterClassMapper {
  public static toDomain = (payload: CharacterClassOrmEntity): CharacterClass => {
    return CharacterClass.create({
      description: ClassDescriptionVo.create(payload.description),
      id: payload.id,
      logo: payload.logo,
      name: payload.name,
      factionId: payload.factionId,
      skillsIds: payload.skillsIds,
    });
  };

  public static toPersistence = (payload: CharacterClass): CharacterClassOrmEntity => {
    const snapshot = payload.snapshot();
    return {
      description: snapshot.description,
      factionId: snapshot.factionId,
      id: snapshot.id,
      skillsIds: snapshot.skillsIds,
      name: snapshot.name,
      logo: snapshot.logo,
    };
  };
}
