import { MobSpawn } from 'src/world/spawn/entities/mob-spawn.entity';

import { IRuntimeMob } from '../types/runtime-mob.type';

import { AggroTable } from './aggro.lib';

export function buildRuntimeMobs(mobSpawn: MobSpawn): IRuntimeMob[] {
  if (!mobSpawn.entity) throw new Error('Mob is not loaded in spawn!');
  if (!mobSpawn.location) throw new Error('Location is not loaded in spawn!');
  return mobSpawn.entity.map(mob => ({
    spawnId: mobSpawn.id,
    id: mob.id,
    name: mob.name,
    x: mobSpawn.spawnX,
    y: mobSpawn.spawnY,
    spawnX: mobSpawn.spawnX,
    spawnY: mobSpawn.spawnY,
    walkSpeed: mob.walkSpeed,
    triggerRange: mob.triggerRange,
    respawnTime: mob.respawnTime,
    type: 'mob',
    state: 'idle',
    respawnIn: null,
    physicalDefense: mob.physicalDefense,
    magicDefense: mob.magicDefense,
    maxHp: mob.maxHp,
    locationId: mobSpawn.location.id,
    level: mob.level,
    lastMoveAt: 0,
    lastHpRegenerationTime: 0,
    lastAttackAt: 0,
    nextThinkAt: 0,
    lastDirection: 'down',
    isInSpawnArea: true,
    isAttacking: false,
    isAlive: true,
    hp: mob.hp,
    expReward: mob.expReward,
    currentTarget: null,
    currentPath: null,
    critMultiplier: mob.critMultiplier,
    chaseSpeed: mob.chaseSpeed,
    basePhysicalDamage: mob.basePhysicalDamage,
    baseMagicDamage: mob.baseMagicDamage,
    attackSpeed: mob.attackSpeed,
    attackRange: mob.attackRange,
    areaRadius: mobSpawn.areaRadius,
    aggro: new AggroTable(),
  }));
}
