import { Appearance } from 'src/common/domain/vo/appearance.vo';

import { Character } from '../../domain/entities/character.entity';

import { CharacterOrmEntity } from './character-orm.entity';

export class CharacterMapper {
  public static toDomain = (payload: CharacterOrmEntity): Character => {
    return Character.create({
      y: payload.y,
      x: payload.x,
      id: payload.id,
      createdAt: payload.createdAt,
      isAlive: payload.isAlive,
      isDeleted: payload.isDeleted,
      skillsIds: payload.skillsIds,
      classId: payload.classId,
      userId: payload.userId,
      locationId: payload.locationId,
      equipmentId: payload.equipmentId,
      appearance: Appearance.create({
        body: payload.appearance.body,
        head: payload.appearance.head,
      }),
      bagId: payload.bagId,
      questsIds: payload.questsIds,
      walkSpeed: payload.walkSpeed,
      physicalDefense: payload.physicalDefense,
      skillPoints: payload.skillPoints,
      name: payload.name,
      maxHp: payload.maxHp,
      magicDefense: payload.magicDefense,
      level: payload.level,
      experienceToNextLevel: payload.experienceToNextLevel,
      hp: payload.hp,
      experience: payload.experience,
      critMultiplier: payload.critMultiplier,
      basePhysicalDamage: payload.basePhysicalDamage,
      baseMagicDamage: payload.baseMagicDamage,
      attackSpeed: payload.attackSpeed,
      attackRange: payload.attackRange,
    });
  };

  public static toPersistence = (domain: Character): CharacterOrmEntity => {
    const snapshot = domain.snapshot();

    return {
      y: snapshot.y,
      x: snapshot.x,
      id: snapshot.id,
      createdAt: snapshot.createdAt,
      updatedAt: new Date(),
      isAlive: snapshot.isAlive,
      isDeleted: snapshot.isDeleted,
      skillsIds: snapshot.skillsIds,
      classId: snapshot.classId,
      userId: snapshot.userId,
      locationId: snapshot.locationId,
      equipmentId: snapshot.equipmentId,
      appearance: snapshot.appearance,
      bagId: snapshot.bagId,
      questsIds: snapshot.questsIds,
      walkSpeed: snapshot.walkSpeed,
      physicalDefense: snapshot.physicalDefense,
      skillPoints: snapshot.skillPoints,
      name: snapshot.name,
      maxHp: snapshot.maxHp,
      magicDefense: snapshot.magicDefense,
      level: snapshot.level,
      experienceToNextLevel: snapshot.experienceToNextLevel,
      hp: snapshot.hp,
      experience: snapshot.experience,
      critMultiplier: snapshot.critMultiplier,
      basePhysicalDamage: snapshot.basePhysicalDamage,
      baseMagicDamage: snapshot.baseMagicDamage,
      attackSpeed: snapshot.attackSpeed,
      attackRange: snapshot.attackRange,
    };
  };
}
