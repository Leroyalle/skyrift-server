import {
  BAG_ITEM_MANAGEMENT_USE_CASE_TOKEN,
  type BagItemManagementUseCasePort,
  type RuntimeItem,
} from 'src/realtime/container';

import { Inject, Injectable } from '@nestjs/common';

interface ItemAddPayload {
  containerId: string;
  item: RuntimeItem;
}

interface ItemRemovePayload {
  containerId: string;
  itemId: string;
}

@Injectable()
export class ManageBagUseCase {
  constructor(
    @Inject(BAG_ITEM_MANAGEMENT_USE_CASE_TOKEN)
    private readonly bagItemManagementUseCase: BagItemManagementUseCasePort,
  ) {}

  public add(payload: ItemAddPayload) {
    // FIXME: делать проверку действительно ли контейнер пренадлежит эмиттеру
    this.bagItemManagementUseCase.addItemToBag(payload.containerId, payload.item);
  }

  public remove(payload: ItemRemovePayload) {
    // FIXME: делать проверку действительно ли контейнер пренадлежит эмиттеру
    this.bagItemManagementUseCase.removeItemFromBag(payload.containerId, payload.itemId);
  }
}
