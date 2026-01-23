import { EquipmentSlotEnum } from 'src/common/enums/equipment-slot.enum';
import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import { TItem } from 'src/common/types/item.type';
import { Armor, BaseItem, Weapon } from 'src/item/entities/item.entity';
import { isArmor } from 'src/item/guards/is-armor';
import { isWeapon } from 'src/item/guards/is-weapon';

import { Injectable } from '@nestjs/common';

import { PlayerStateService } from '../../player-state.service';

@Injectable()
export class RuntimeEquipmentService {
  constructor(private readonly playerStateService: PlayerStateService) {}

  public checkCanEquip(item: TItem, slot: EquipmentSlotEnum): boolean {
    if (!isWeapon(item) && !isArmor(item)) return false;

    if (item.slot !== slot) return false;

    return true;
  }

  public equip(
    characterId: string,
    item: TItem,
    slot: EquipmentSlotEnum,
  ): { success: boolean; error?: string } {
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

    character.equipment[slot] = item;

    return {
      success: true,
    };
  }

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
