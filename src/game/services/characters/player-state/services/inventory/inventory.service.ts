import { Bag } from 'src/characters/character/bag/entities/bag.entity';
import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import { TItem } from 'src/common/types/item.type';
import { BaseItem } from 'src/item/entities/item.entity';
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PlayerStateService } from '../../player-state.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(BaseItem)
    private readonly itemRepository: Repository<BaseItem>,
    private readonly playerStateService: PlayerStateService,
  ) {}

  public add(bag: Bag, item: TItem): void {
    bag.items.push(item);
  }

  public delete(bag: Bag, item: TItem): void {
    bag.items = bag.items.filter(i => i.id !== item.id);
  }

  /**
   * Метод проверяет можно ли использовать предмет
   * @description Ищет предмет в сумке
   * @param characterId Айди персонажа
   * @param itemId Айди предмета
   * @returns При успехе возвращает предмет, при ошибке текст
   */
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

  /**
   * Метод возвращает тип использования предмета
   * @param item Предмет
   * @returns Тип действия, equip / use etc
   */

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
  };

  public async addAndPersist(bag: Bag, item: TItem) {
    item.bag = bag;
    const savedItem = await this.itemRepository.save(item);
    this.add(bag, savedItem);
    await this.itemRepository.save(item);
  }
}
