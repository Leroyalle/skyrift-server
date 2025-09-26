import { MobSpawn } from 'src/mob/mob-spawn/entities/mob-spawn.entity';
import { RuntimeMob } from '../types/runtime-mob.type';

export function buildRuntimeMob(mobSpawn: MobSpawn): RuntimeMob {
  if (!mobSpawn.mob) throw new Error('Mob is not loaded in spawn!');
  const {
    location: _,
    mob: { id: mobId, ...mobStats },
    ...mobSpawnStats
  } = mobSpawn;
  return {
    ...mobStats,
    ...mobSpawnStats,
    mobId,
    locationId: mobSpawn.location.id,
    type: 'mob',
    isInSpawnArea: true,
    lastMoveAt: 123123,
    lastDirection: 'down',
    lastAttackAt: 3423,
    respawnIn: null,
    currentPath: null,
    currentTarget: null,
    isAttacking: false,
    state: 'idle',
  };
}
