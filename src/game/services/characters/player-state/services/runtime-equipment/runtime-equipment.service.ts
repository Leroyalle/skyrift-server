import { EquipmentSlotEnum } from 'src/common/enums/equipment-slot.enum';
import { TItem } from 'src/common/types/item.type';
import { Armor, Weapon } from 'src/item/entities/item.entity';
import { isArmor } from 'src/item/guards/is-armor';
import { isWeapon } from 'src/item/guards/is-weapon';

import { Injectable } from '@nestjs/common';

import { PlayerStateService } from '../../player-state.service';

@Injectable()
export class RuntimeEquipmentService {
  constructor(private readonly playerStateService: PlayerStateService) {}

  /**
   * Метод проверяет можн ли экипировать предмет
   * @param item Экипируемый предмет
   * @param slot Экипируемый слот
   * @returns Boolean можно ли экпировать предмет
   */

  public checkCanEquip(item: TItem, slot: EquipmentSlotEnum): boolean {
    if (!isWeapon(item) && !isArmor(item)) return false;

    if (item.slot !== slot) return false;

    return true;
  }

  /**
   * Метод экипирует предмет в выбранный слот
   * @param characterId Айди персонажа
   * @param item Экипируемый предмет
   * @param slot Экипируемый слот
   * @returns При успехе старый надетый предмет, при ошибке текст
   */

  public equip(
    characterId: string,
    item: TItem,
    slot: EquipmentSlotEnum,
  ): { success: true; oldItem: Weapon | Armor | null } | { success: false; error?: string } {
    if (!this.checkCanEquip(item, slot))
      return {
        success: false,
        error: 'Нельзя экипировать этот предмет',
      };

    const character = this.playerStateService.getCharacterState(characterId);

    if (!character)
      return {
        success: false,
        error: 'Персонаж не найден',
      };

    const oldItem = character.equipment[slot] as Weapon | Armor | null;

    character.equipment[slot] = item;

    return {
      success: true,
      oldItem,
    };
  }

  /**
   * Метод снимает предмет из экипировки по слоту и возвращает предмет надетый до снятия
   * @param characterId Айди персонажа
   * @param slot Слот
   * @returns Предмет надетый до снятия
   */

  public unEquip(
    characterId: string,
    slot: EquipmentSlotEnum,
  ): { success: boolean; error?: string; item?: TItem | null } {
    const character = this.playerStateService.getCharacterState(characterId);

    if (!character) {
      return {
        success: false,
        error: 'Персонаж не найден',
      };
    }

    const item = character.equipment[slot] as TItem;
    character.equipment[slot] = null;

    return {
      success: true,
      item,
    };
  }
}
