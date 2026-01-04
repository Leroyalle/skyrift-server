import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { IRuntimeMob } from '../characters/runtime-mob/types/runtime-mob.type';
import { IRuntimeNpc } from '../characters/runtime-npc/types/runtime-npc.type';
import { Injectable } from '@nestjs/common';
import { isPlayer } from '../combat/lib/entity/guards/is-player.lib';
import { isMob } from '../combat/lib/entity/guards/is-mob.lib';
import { isNpc } from '../combat/lib/entity/guards/is-npc';
import { getOrCreate } from 'src/game/lib/helpers/get-or-create-array.lib';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { EntityType } from 'src/game/types/entity/entity-type.type';

type PlayerRef = { type: Extract<EntityType, 'player'>; id: string };
type MobRef = { type: Extract<EntityType, 'mob'>; id: string };
type NpcRef = { type: Extract<EntityType, 'npc'>; id: string };

@Injectable()
export class EntityRegistryService {
  private readonly mobs = new Map<string, IRuntimeMob>();
  private readonly npcs = new Map<string, IRuntimeNpc>();
  private readonly characters: Map<string, IRuntimeCharacter> = new Map();
  private readonly mobsByLocation: Map<string, Set<string>> = new Map();
  private readonly npcByLocation: Map<string, Set<string>> = new Map();

  get charactersArray() {
    return Array.from(this.characters.values());
  }

  get mobsArray() {
    return Array.from(this.mobs.values());
  }

  get npcsArray() {
    return Array.from(this.npcs.values());
  }

  public add(entity: TRuntimeEntity) {
    if (isPlayer(entity)) {
      this.characters.set(entity.id, entity);
    } else if (isMob(entity)) {
      this.mobs.set(entity.id, entity);
      const set = getOrCreate(this.mobsByLocation, entity.locationId, () => new Set());
      set.add(entity.id);
    } else if (isNpc(entity)) {
      this.npcs.set(entity.id, entity);
      const set = getOrCreate(this.npcByLocation, entity.locationId, () => new Set());
      set.add(entity.id);
    }
  }

  public remove(entityRef: EntityRef & { locationId: string }) {
    if (entityRef.type === 'player') {
      this.characters.delete(entityRef.id);
    } else if (entityRef.type === 'mob') {
      this.mobs.delete(entityRef.id);
      this.mobsByLocation.get(entityRef.locationId)?.delete(entityRef.id);
    } else if (entityRef.type === 'npc') {
      this.npcs.delete(entityRef.id);
      this.npcByLocation.get(entityRef.locationId)?.delete(entityRef.id);
    }
  }

  public getByRef(ref: PlayerRef): IRuntimeCharacter | undefined;
  public getByRef(ref: MobRef): IRuntimeMob | undefined;
  public getByRef(ref: NpcRef): IRuntimeNpc | undefined;
  public getByRef(ref: EntityRef): TRuntimeEntity | undefined;
  public getByRef(ref: EntityRef) {
    switch (ref.type) {
      case 'player':
        return this.characters.get(ref.id);
      case 'mob':
        return this.mobs.get(ref.id);
      case 'npc':
        return this.npcs.get(ref.id);
    }
  }

  public getEntitiesByLocation(type: 'mob', locationId: string): IRuntimeMob[];
  public getEntitiesByLocation(type: 'npc', locationId: string): IRuntimeNpc[];
  public getEntitiesByLocation(
    type: 'mob' | 'npc',
    locationId: string,
  ): IRuntimeMob[] | IRuntimeNpc[];
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
