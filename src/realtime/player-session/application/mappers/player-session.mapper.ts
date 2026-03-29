import type { PlayerSession } from '../../domain/entities/player-session.entity';

type Appearance = {
  body: string;
  head: string;
};

type Props = {
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
  appearance: Appearance;
  createdAt: Date;
  bagId: string;
};

export class PlayerSessionMapper {
  public static toDomainData(payload: Props): PlayerSession['props'] {
    return {
      userId: payload.userId,
      position: {
        locationId: payload.locationId,
        x: payload.x,
        y: payload.y,
      },
      name: payload.name,
      level: payload.level,
      baseStats: {
        maxHp: payload.maxHp,
        basePhysicalDamage: payload.basePhysicalDamage,
        baseMagicDamage: payload.baseMagicDamage,
        physicalDefense: payload.physicalDefense,
        magicDefense: payload.magicDefense,
        attackSpeed: payload.attackSpeed,
        attackRange: payload.attackRange,
        walkSpeed: payload.walkSpeed,
      },
      dirty: false,
      characterId: payload.id,
      combat: {
        hp: payload.hp,
        isAlive: payload.isAlive,
        currentTargetId: null,
        lastAttackAt: 0,
        lastMoveAt: 0,
      },
      equipmentId: payload.equipmentId,
      bagId: payload.bagId,
      skillsById: new Map(),
    };
  }
}
