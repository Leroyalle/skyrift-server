import { BAG_FACADE_TOKEN, BagFacadePort } from 'src/modules/bag';
import {
  ITEM_INSTANCE_FACADE_TOKEN,
  ITEM_TEMPLATE_FACADE_TOKEN,
  ItemInstanceFacadePort,
  ItemTemplateFacadePort,
} from 'src/modules/item';
import {
  CONTAINER_INITIALIZER_TOKEN,
  ContainerInitializerPort,
  IBagContainer,
} from 'src/realtime/container';

import { Inject, Injectable } from '@nestjs/common';

import { ContainerInitializerMapper } from '../../mappers/container-initializer.mapper';

@Injectable()
export class RuntimeBagLoader {
  constructor(
    @Inject(BAG_FACADE_TOKEN) private readonly bagFacade: BagFacadePort,
    @Inject(CONTAINER_INITIALIZER_TOKEN)
    private readonly containerInitializer: ContainerInitializerPort,
    @Inject(ITEM_INSTANCE_FACADE_TOKEN) private readonly itemInstanceFacade: ItemInstanceFacadePort,
    @Inject(ITEM_TEMPLATE_FACADE_TOKEN) private readonly itemTemplateFacade: ItemTemplateFacadePort,
  ) {}
  public async execute(bagId: string): Promise<IBagContainer> {
    const bag = await this.bagFacade.getById(bagId);

    if (!bag) throw new Error('Bag not found');

    const bagItems = await this.itemInstanceFacade.findByContainerRef(bagId, 'bag');
    const bagItemTemplates = await this.itemTemplateFacade.findByIds(
      bagItems.map(item => item.templateId),
    );
    const bagProps = ContainerInitializerMapper.toBagProps({
      bag,
      itemInstances: bagItems,
      itemTemplates: bagItemTemplates,
    });
    return this.containerInitializer.initializeBag(bagProps);
  }
}
