import { Bag } from 'src/characters/character/bag/entities/bag.entity';
import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { TItem } from 'src/common/types/item.type';
import { SocketService } from 'src/game/services/socket/socket.service';
import { isArmor } from 'src/item/guards/is-armor';
import { isWeapon } from 'src/item/guards/is-weapon';

import { Injectable } from '@nestjs/common';

import { PlayerStateService } from '../../player-state.service';
import { RuntimeEquipmentService } from '../runtime-equipment/runtime-equipment.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly playerStateService: PlayerStateService,
    private readonly socketService: SocketService,
    private readonly equipmentService: RuntimeEquipmentService,
  ) {}

  public add(bag: Bag, item: TItem): void {
    bag.items.push(item);
  }

  public delete(bag: Bag, item: TItem): void {
    bag.items = bag.items.filter(i => i.id !== item.id);
  }

  public use(characterId: string, itemId: string) {
    const character = this.playerStateService.getCharacterState(characterId);
    if (!character) return;

    console.log('character.bag.items', character.bag.items);

    const item = character.bag.items.find(item => item.id === itemId);

    if (!item) {
      this.socketService.sendToUser(
        RedisKeys.Location + character.locationId,
        ServerToClientEvents.GameNotification,
        {
          type: 'error',
          message: 'Предмет не найден',
        },
      );

      console.log('[InventoryService.use] Предмет не найден');
      return;
    }

    switch (item.itemType) {
      case ItemTypeEnum.WEAPON:
      case ItemTypeEnum.ARMOR: {
        console.log('IN SWITCH');
        if (isArmor(item) || isWeapon(item)) {
          const result = this.equipmentService.equip(character.id, item, item.slot);
          console.log('AFTER EQUIP', result);
          if (result.success) {
            this.socketService.sendTo(
              // TODO: вынести отсюда сокет
              // FIXME: сейчас шлется всем событие, нужно одному + всем смена экипировки, либо оставить
              RedisKeys.Location + character.locationId,
              ServerToClientEvents.ItemMoved,
              {
                entityRef: {
                  id: character.id,
                  type: character.type,
                },
                itemId: itemId,
                from: {
                  container: 'bag',
                  // slot: result.fromSlot,
                },
                to: {
                  container: 'equipment',
                  slot: item.slot,
                },
              },
            );
          } else {
            this.socketService.sendToUser(character.userId, ServerToClientEvents.GameNotification, {
              type: 'error',
              message: result.error,
            });
          }
        }
        break;
      }

      default:
        console.warn('Неизвестный тип предмета');
        break;
    }
  }

  public checkCanUse(
    characterId: string,
    itemId: string,
  ): { success: true; item: TItem } | { success: false; error: string } {
    const character = this.playerStateService.getCharacterState(characterId);

    if (!character)
      return {
        success: false,
        error: 'Персонаж не найден',
      };

    console.log('character.bag.items', character.bag.items);

    const item = character.bag.items.find(item => item.id === itemId);

    if (!item) {
      console.log('[InventoryService.use] Предмет не найден');
      return {
        success: false,
        error: 'Предмет не найден',
      };
    }

    return {
      success: true,
      item: item as TItem,
    };
  }

  public resolveUse = (item: TItem): { action: 'equip' | 'use' | 'error' } => {
    switch (item.itemType) {
      case ItemTypeEnum.WEAPON:
      case ItemTypeEnum.ARMOR: {
        return {
          action: 'equip',
        };
      }

      default: {
        return {
          action: 'error',
        };
      }
    }

    return {
      action: 'error',
    };
  };
}
