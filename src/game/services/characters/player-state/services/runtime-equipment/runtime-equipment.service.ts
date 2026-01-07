import { EquipmentSlotEnum } from 'src/common/enums/equipment-slot.enum';
import { TItem } from 'src/common/types/item.type';
import { Armor, Weapon } from 'src/item/entities/item.entity';

import { Injectable } from '@nestjs/common';

import { PlayerStateService } from '../../player-state.service';

@Injectable()
export class RuntimeEquipmentService {
  constructor(private readonly playerStateService: PlayerStateService) {}

  public checkCanEquip(item: TItem, slot: EquipmentSlotEnum): boolean {
    if (!(item instanceof Weapon) && !(item instanceof Armor)) return false;

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
  ): { success: boolean; error?: string } {
    const character = this.playerStateService.getCharacterState(characterId);

    if (!character) {
      return {
        success: false,
        error: 'Персонаж не найден',
      };
    }

    character.equipment[slot] = null;

    return {
      success: true,
    };
  }
}
