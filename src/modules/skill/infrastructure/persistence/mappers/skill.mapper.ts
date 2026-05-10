import { Skill } from 'src/modules/skill/domain/entities/skill.entity';

import { SkillOrmEntity } from '../entities/skill-orm.entity';

export class SkillMapper {
  public static toDomain = (payload: SkillOrmEntity): Skill => {
    return Skill.create({
      classId: payload.classId,
      visualEffects: payload.visualEffects,
      extraParams: payload.extraParams,
      duration: payload.duration,
      damagePerSecond: payload.damagePerSecond,
      areaRadius: payload.areaRadius,
      type: payload.type,
      tilesetKey: payload.tilesetKey,
      range: payload.range,
      name: payload.name,
      manaCost: payload.manaCost,
      id: payload.id,
      icon: payload.icon,
      heal: payload.heal,
      damage: payload.damage,
      cooldownMs: payload.cooldownMs,
    });
  };

  public static toPersistence = (domain: Skill): SkillOrmEntity => {
    const snapshot = domain.snapshot();
    return {
      extraParams: snapshot.extraParams,
      visualEffects: snapshot.visualEffects,
      duration: snapshot.duration,
      damagePerSecond: snapshot.damagePerSecond,
      areaRadius: snapshot.areaRadius,
      type: snapshot.type,
      tilesetKey: snapshot.tilesetKey,
      range: snapshot.range,
      name: snapshot.name,
      manaCost: snapshot.manaCost,
      id: snapshot.id,
      icon: snapshot.icon,
      heal: snapshot.heal,
      damage: snapshot.damage,
      cooldownMs: snapshot.cooldownMs,
      classId: snapshot.classId,
    };
  };
}
