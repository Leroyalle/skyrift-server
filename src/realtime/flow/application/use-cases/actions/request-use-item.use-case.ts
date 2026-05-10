import {
  BAG_CONTAINER_READER_TOKEN,
  type BagContainerReaderPort,
  isEquippableItem,
  type RuntimeItem,
} from 'src/realtime/container';
import { ENTITY_RESOLVER_TOKEN, type EntityResolverPort } from 'src/realtime/entity-registry';

import { Inject, Injectable } from '@nestjs/common';

import { type MoveItemPort } from '../../ports/actions/move-item.port';
import type {
  RequestUseItemPayload,
  RequestUseItemPort,
} from '../../ports/actions/request-use-item.port';
import { MOVE_ITEM_USE_CASE_TOKEN } from '../../ports/tokens';

@Injectable()
export class RequestUseItemUseCase implements RequestUseItemPort {
  constructor(
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(BAG_CONTAINER_READER_TOKEN) private readonly bagContainerReader: BagContainerReaderPort,
    @Inject(MOVE_ITEM_USE_CASE_TOKEN) private readonly moveItemUseCase: MoveItemPort,
  ) {}

  public execute(payload: RequestUseItemPayload) {
    const character = this.entityResolver.getByRef({ id: payload.characterId, type: 'player' });

    if (!character) throw new Error('Character not found');

    const item = this.bagContainerReader.findItemById(character.bagId, payload.itemId);

    if (!item) throw new Error('Item not found in bag container');

    const action = this.resolveUse(item);

    if (action === 'error') throw new Error('Item can not be used');

    if (action === 'equip') {
      if (!isEquippableItem(item)) throw new Error('Item is not equippable');
      this.moveItemUseCase.moveFromBagToEquipment({
        characterId: character.id,
        slot: item.slot,
        itemId: item.id,
      });
      return;
    }
  }

  public resolveUse = (item: RuntimeItem): 'equip' | 'use' | 'error' => {
    switch (item.itemType) {
      case 'weapon':
      case 'armor': {
        return 'equip';
      }

      default: {
        return 'error';
      }
    }
  };
}
