import { Npc } from 'src/characters/npc/entities/npc.entity';

export function setupNpc(data: Partial<Npc> = {}): Npc {
  const npc = new Npc();

  Object.assign(npc, {
    name: 'Npc',
    walkSpeed: 450,
    attackRange: 1,
    maxHp: 1000,
    hp: 1000,
    level: 1,
    attackSpeed: 400,
    ...data,
  });

  return npc;
}
