import { Injectable } from '@nestjs/common';
import { Bag } from 'src/character/bag/entities/bag.entity';
import { TItem } from 'src/common/types/item.type';
import { PlayerStateService } from '../../player-state.service';
import { SocketService } from 'src/game/services/socket/socket.service';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import { isArmor } from 'src/item/guards/is-armor';
import { isWeapon } from 'src/item/guards/is-weapon';
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
    bag.items = bag.items.filter((i) => i.id !== item.id);
  }

  public use(characterId: string, itemId: string) {
    const character = this.playerStateService.getCharacterState(characterId);
    if (!character) return;

    const item = character.bag.items.find((item) => item.id === itemId);

    if (!item) {
      this.socketService.sendToUser(
        RedisKeys.Location + character.locationId,
        ServerToClientEvents.GameNotification,
        {
          type: 'error',
          message: 'Предмет не найден',
        },
      );
      return;
    }

    switch (item.itemType) {
      case ItemTypeEnum.WEAPON:
      case ItemTypeEnum.ARMOR: {
        if (isArmor(item) || isWeapon(item)) {
          this.equipmentService.equip(character.id, item, item.slot);
        }
        break;
      }

      default:
        console.warn('Неизвестный тип предмета');
        break;
    }
  }
}
