import type { IBag } from 'src/modules/bag';
import type { IEquipment } from 'src/modules/equipment';
import type { ItemInstance, ItemTemplate } from 'src/modules/item';
import {
  type IBagContainer,
  type IEquipmentContainer,
  isEquippableItem,
  type RuntimeItem,
} from 'src/realtime/container';

export class ContainerInitializerMapper {
  public static toBagProps(payload: {
    bag: IBag;
    itemInstances: ItemInstance[];
    itemTemplates: ItemTemplate[];
  }): IBagContainer {
    const itemTemplatesMap = new Map<string, ItemTemplate>(
      payload.itemTemplates.map(itemTemplate => [itemTemplate.id, itemTemplate]),
    );

    const runtimeItems = payload.itemInstances.reduce<RuntimeItem[]>((acc, instanceItem) => {
      const template = itemTemplatesMap.get(instanceItem.templateId);
      if (!template) throw new Error('Template not found');
      const { id: _, ...templateItem } = template;

      acc.push({
        ...instanceItem,
        ...templateItem,
      });

      return acc;
    }, []);

    return {
      id: payload.bag.id,
      type: 'bag',
      capacity: payload.bag.maxSlots,
      ownerId: payload.bag.ownerId,
      ownerType: payload.bag.ownerType,
      currentSlots: payload.bag.currentSlots,
      items: runtimeItems,
    };
  }

  public static toEquipmentProps(payload: {
    equipment: IEquipment;
    itemInstances: ItemInstance[];
    itemTemplates: ItemTemplate[];
  }): IEquipmentContainer {
    const itemTemplatesMap = new Map<string, ItemTemplate>(
      payload.itemTemplates.map(itemTemplate => [itemTemplate.id, itemTemplate]),
    );

    const initial: IEquipmentContainer['slots'] = {
      helmet: null,
      breastplate: null,
      gloves: null,
      legs: null,
      cloak: null,
      mainHand: null,
      offHand: null,
      ring1: null,
      ring2: null,
    };

    const equipmentItems = payload.itemInstances.reduce<IEquipmentContainer['slots']>(
      (acc, instanceItem) => {
        const template = itemTemplatesMap.get(instanceItem.templateId);
        if (!template) throw new Error('Template not found');

        if (!template.slot) throw new Error("Template doesn't have a slot");

        if (template.itemType !== 'weapon' && template.itemType !== 'armor') {
          throw new Error('Template is not a weapon or armor');
        }

        const { id: _, ...templateItem } = template;

        const eqItem = { ...instanceItem, ...templateItem };
        if (!isEquippableItem(eqItem)) throw new Error('Item is not equippable');

        acc[template.slot] = eqItem;

        return acc;
      },
      initial,
    );

    return {
      id: payload.equipment.id,
      type: 'equipment',
      slots: equipmentItems,
    };
  }
}
