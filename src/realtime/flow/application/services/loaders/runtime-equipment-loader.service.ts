import { EQUIPMENT_FACADE_TOKEN, EquipmentFacadePort } from 'src/modules/equipment';
import {
  ITEM_INSTANCE_FACADE_TOKEN,
  ITEM_TEMPLATE_FACADE_TOKEN,
  ItemInstanceFacadePort,
  ItemTemplateFacadePort,
} from 'src/modules/item';
import {
  CONTAINER_INITIALIZER_TOKEN,
  ContainerInitializerPort,
  IEquipmentContainer,
} from 'src/realtime/container';

import { Inject, Injectable } from '@nestjs/common';

import { ContainerInitializerMapper } from '../../mappers/container-initializer.mapper';

@Injectable()
export class RuntimeEquipmentLoader {
  constructor(
    @Inject(EQUIPMENT_FACADE_TOKEN) private readonly equipmentFacade: EquipmentFacadePort,
    @Inject(CONTAINER_INITIALIZER_TOKEN)
    private readonly containerInitializer: ContainerInitializerPort,
    @Inject(ITEM_INSTANCE_FACADE_TOKEN) private readonly itemInstanceFacade: ItemInstanceFacadePort,
    @Inject(ITEM_TEMPLATE_FACADE_TOKEN) private readonly itemTemplateFacade: ItemTemplateFacadePort,
  ) {}
  public async execute(equipmentId: string): Promise<IEquipmentContainer> {
    const equipment = await this.equipmentFacade.findById(equipmentId);
    if (!equipment) throw new Error('Equipment is not found');

    const equipmentItems = await this.itemInstanceFacade.findByContainerRef(
      equipmentId,
      'equipment',
    );
    const equipmentItemTemplates = await this.itemTemplateFacade.findByIds(
      equipmentItems.map(item => item.templateId),
    );

    const equipmentProps = ContainerInitializerMapper.toEquipmentProps({
      equipment,
      itemInstances: equipmentItems,
      itemTemplates: equipmentItemTemplates,
    });

    return this.containerInitializer.initializeEquipment(equipmentProps);
  }
}
