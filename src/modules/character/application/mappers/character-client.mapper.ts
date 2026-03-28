import type { Character } from '../../domain/entities/character.entity';

export interface CharacterClientDto {
  experience: number;
  experienceToNextLevel: number;
  skillPoints: number;
  isDeleted: boolean;
  userId: string;
  classId: string;
  skillsIds: string[];
  locationId: string;
  id: string;
  name: string;
  level: number;
  maxHp: number;
  hp: number;
  basePhysicalDamage: number;
  baseMagicDamage: number;
  physicalDefense: number;
  magicDefense: number;
  critMultiplier: number;
  attackSpeed: number;
  attackRange: number;
  isAlive: boolean;
  questsIds: string[];
  x: number;
  y: number;
  walkSpeed: number;
  equipmentId: string;
  appearance: {
    body: string;
    head: string;
  };
  createdAt: Date;
  bagId: string;
}

export class CharacterClientMapper {
  public static toClient = (payload: Character): CharacterClientDto => {
    const snapshot = payload.snapshot();
    const appearance = snapshot.appearance.snapshot();
    return {
      x: snapshot.x,
      walkSpeed: snapshot.walkSpeed,
      y: snapshot.walkSpeed,
      skillsIds: snapshot.skillsIds,
      userId: snapshot.userId,
      skillPoints: snapshot.skillPoints,
      questsIds: snapshot.questsIds,
      physicalDefense: snapshot.physicalDefense,
      maxHp: snapshot.maxHp,
      hp: snapshot.hp,
      id: snapshot.id,
      isDeleted: snapshot.isDeleted,
      isAlive: snapshot.isAlive,
      locationId: snapshot.locationId,
      classId: snapshot.classId,
      critMultiplier: snapshot.critMultiplier,
      experience: snapshot.experience,
      experienceToNextLevel: snapshot.experienceToNextLevel,
      name: snapshot.name,
      level: snapshot.level,
      basePhysicalDamage: snapshot.basePhysicalDamage,
      baseMagicDamage: snapshot.baseMagicDamage,
      attackSpeed: snapshot.attackSpeed,
      attackRange: snapshot.attackRange,
      magicDefense: snapshot.magicDefense,
      equipmentId: snapshot.equipmentId,
      createdAt: snapshot.createdAt,
      bagId: snapshot.bagId,
      appearance: {
        body: appearance.body,
        head: appearance.head,
      },
    };
  };
}
