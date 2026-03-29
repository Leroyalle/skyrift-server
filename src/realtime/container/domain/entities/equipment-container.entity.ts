import type { EquipmentSlot, RuntimeEquippableItem } from '../types/equippable-item.type';
import type { RuntimeContainerType } from '../types/runtime-item.type';

type Props = {
  id: string;
  type: RuntimeContainerType;
  ownerId: string;
  slots: Record<EquipmentSlot, RuntimeEquippableItem | null>;
  capacity: number | null;
};

export class EquipmentContainer {
  private constructor(private readonly props: Props) {}

  public static create(props: Props): EquipmentContainer {
    return new EquipmentContainer(props);
  }

  public get id(): string {
    return this.props.id;
  }

  public get ownerId(): string {
    return this.props.ownerId;
  }

  public getItem(slot: EquipmentSlot): RuntimeEquippableItem | null {
    return this.props.slots[slot];
  }

  public hasItem(slot: EquipmentSlot): boolean {
    return this.props.slots[slot] !== null;
  }

  public canEquip(item: RuntimeEquippableItem, slot: EquipmentSlot): boolean {
    return item.slot === slot;
  }

  public equip(
    item: RuntimeEquippableItem,
    slot: EquipmentSlot,
  ): { equipped: RuntimeEquippableItem; previous: RuntimeEquippableItem | null } {
    if (!this.canEquip(item, slot)) {
      throw new Error('Item cannot be equipped into this slot');
    }

    const previous = this.props.slots[slot];
    this.props.slots[slot] = item;

    return {
      equipped: item,
      previous,
    };
  }

  public unequip(slot: EquipmentSlot): RuntimeEquippableItem | null {
    const current = this.props.slots[slot];

    if (!current) {
      return null;
    }

    this.props.slots[slot] = null;
    return current;
  }

  public equippedItems(): RuntimeEquippableItem[] {
    return Object.values(this.props.slots).flatMap(item => (item ? [item] : []));
  }

  public snapshot(): Readonly<EquipmentContainer['props']> {
    return {
      ...this.props,
    };
  }
}
