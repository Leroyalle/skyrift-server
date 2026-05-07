import { OwnedSkill } from 'src/modules/owned-skill/domain/entities/owned-skill.entity';

import type { OwnedSkillOrmEntity } from '../entities/owned-skill-orm.entity';

export class OwnedSkillMapper {
  public static toDomain = (persistence: OwnedSkillOrmEntity): OwnedSkill => {
    return OwnedSkill.create({
      cooldownEnd: persistence.cooldownEnd,
      id: persistence.id,
      lastUsedAt: persistence.lastUsedAt,
      level: persistence.level,
      ownerRef: { id: persistence.ownerId, type: persistence.ownerType },
      skillId: persistence.skillId,
    });
  };

  public static toPersistence = (domain: OwnedSkill): OwnedSkillOrmEntity => {
    const snapshot = domain.snapshot();
    return {
      cooldownEnd: snapshot.cooldownEnd,
      skillId: snapshot.skillId,
      ownerType: snapshot.ownerRef.type,
      ownerId: snapshot.ownerRef.id,
      lastUsedAt: snapshot.lastUsedAt,
      level: snapshot.level,
      id: snapshot.id,
    };
  };
}
