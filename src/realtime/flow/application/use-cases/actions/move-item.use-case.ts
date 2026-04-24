import { MOVE_ITEM_USE_CASE_TOKEN, type MoveItemUseCasePort } from 'src/realtime/container';
import { ENTITY_RESOLVER_TOKEN, type EntityResolverPort } from 'src/realtime/entity-registry';

import { Inject, Injectable } from '@nestjs/common';

import type {
  MoveFromBagToEquipmentPayload,
  MoveFromEquipmentToBagPayload,
  MoveItemPort,
  MoveItemResult,
} from '../../ports/actions/move-item.port';

@Injectable()
export class MoveItemUseCase implements MoveItemPort {
  constructor(
    @Inject(MOVE_ITEM_USE_CASE_TOKEN) private readonly moveItemUseCase: MoveItemUseCasePort,
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
  ) {}

  public moveFromBagToEquipment(payload: MoveFromBagToEquipmentPayload): MoveItemResult {
    const character = this.entityResolver.getByRef({ id: payload.characterId, type: 'player' });
    if (!character) throw new Error('Character not found');
    const changes = this.moveItemUseCase.moveFromBagToEquipment({
      bagId: character.bagId,
      equipmentId: character.equipmentId,
      slot: payload.slot,
      itemId: payload.itemId,
    });

    return { changes, entityRef: { id: character.id, type: character.type } };
  }

  public moveFromEquipmentToBag(payload: MoveFromEquipmentToBagPayload): MoveItemResult {
    const character = this.entityResolver.getByRef({ id: payload.characterId, type: 'player' });
    if (!character) throw new Error('Character not found');
    const changes = this.moveItemUseCase.moveFromEquipmentToBag({
      bagId: character.bagId,
      equipmentId: character.equipmentId,
      slot: payload.slot,
    });

    return { changes, entityRef: { id: character.id, type: character.type } };
  }
}
