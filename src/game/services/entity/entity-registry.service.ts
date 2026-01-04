import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { IRuntimeMob } from '../characters/runtime-mob/types/runtime-mob.type';
import { IRuntimeNpc } from '../characters/runtime-npc/types/runtime-npc.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EntityRegistryService {
  private readonly mobs = new Map<string, IRuntimeMob>();
  private readonly npcs = new Map<string, IRuntimeNpc>();
  private readonly characters: Map<string, IRuntimeCharacter> = new Map();
  private readonly mobsByLocation: Map<string, Set<string>> = new Map();
  private readonly npcByLocation: Map<string, Set<string>> = new Map();

  public getByRef(ref: EntityRef): TRuntimeEntity | undefined {
    switch (ref.type) {
      case 'player':
        return this.characters.get(ref.id);

      case 'mob':
        return this.mobs.get(ref.id);

      case 'npc':
        return this.npcs.get(ref.id);

      default:
        break;
    }
  }

  public getEntitiesByLocation(
    type: 'mob' | 'npc',
    locationId: string,
  ): (IRuntimeMob | IRuntimeNpc)[] {
    switch (type) {
      case 'mob':
        return Array.from(this.mobsByLocation.get(locationId) ?? [])?.flatMap(id => {
          const mob = this.mobs.get(id);
          return mob ? [mob] : [];
        });

      case 'npc':
        return Array.from(this.npcByLocation.get(locationId) ?? [])?.flatMap(id => {
          const npc = this.npcs.get(id);
          return npc ? [npc] : [];
        });
    }
  }
}
