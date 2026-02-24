import { NpcSpawn } from 'src/world/spawn/entities/npc-spawn.entity';

import { IRuntimeNpc } from '../types/runtime-npc.type';

export function buildRuntimeNpc(npcSpawn: NpcSpawn): IRuntimeNpc[] {
  if (!npcSpawn.entities) throw new Error('Npc is not loaded in spawn!');
  if (!npcSpawn.location) throw new Error('Location is not loaded in spawn!');

  return npcSpawn.entities.map(npc => ({
    x: npc.x,
    appearance: npc.appearance,
    y: npc.y,
    walkSpeed: npc.walkSpeed,
    type: 'npc',
    state: 'idle',
    spawnX: npcSpawn.spawnX,
    spawnY: npcSpawn.spawnY,
    respawnIn: 0,
    physicalDefense: npc.physicalDefense,
    id: npc.id,
    spawnId: npcSpawn.id,
    nextThinkAt: 0,
    name: npc.name,
    maxHp: npc.maxHp,
    magicDefense: npc.magicDefense,
    locationId: npcSpawn.location.id,
    level: npc.level,
    lastMoveAt: 0,
    lastHpRegenerationTime: 0,
    equipment: npc.equipment,
    lastDirection: 'down',
    lastAttackAt: 0,
    isInSpawnArea: true,
    isAttacking: false,
    isAlive: npc.isAlive,
    // FIXME: поменять местами у всех сущностей айди спавна и ентити
    hp: npc.hp,
    givenQuests: npc.givenQuests,
    currentTarget: null,
    currentPath: null,
    critMultiplier: npc.critMultiplier,
    basePhysicalDamage: npc.basePhysicalDamage,
    baseMagicDamage: npc.baseMagicDamage,
    attackSpeed: npc.attackSpeed,
    attackRange: npc.attackRange,
    areaRadius: npcSpawn.areaRadius,
    services: npc.services,
  }));
}
