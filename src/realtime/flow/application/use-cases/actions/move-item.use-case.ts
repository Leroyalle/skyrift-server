import { SOCKET_ADAPTER_TOKEN, SocketAdapterPort } from 'src/infrastructure/ws';
import { MOVE_ITEM_USE_CASE_TOKEN, type MoveItemUseCasePort } from 'src/realtime/container';
import { RedisKeys } from 'src/realtime/contracts/constants/redis-keys.constant';
import { ServerToClientEvents } from 'src/realtime/contracts/constants/socket-events.constant';
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
    @Inject(SOCKET_ADAPTER_TOKEN) private readonly socketAdapter: SocketAdapterPort,
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

    const result: MoveItemResult = {
      changes,
      entityRef: { id: character.id, type: character.type },
    };

    this.socketAdapter.sendTo(
      // FIXME: сейчас шлется всем событие, нужно одному + всем смена экипировки, либо оставить
      RedisKeys.Location + character.position.locationId,
      ServerToClientEvents.ItemMoved,
      result,
    );

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

    const result: MoveItemResult = {
      changes,
      entityRef: { id: character.id, type: character.type },
    };

    this.socketAdapter.sendTo(
      // FIXME: сейчас шлется всем событие, нужно одному + всем смена экипировки, либо оставить
      RedisKeys.Location + character.position.locationId,
      ServerToClientEvents.ItemMoved,
      result,
    );

    return { changes, entityRef: { id: character.id, type: character.type } };
  }
}
