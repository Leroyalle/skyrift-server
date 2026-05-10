import {
  BAG_ITEM_MANAGEMENT_USE_CASE_TOKEN,
  type BagItemManagementUseCasePort,
} from 'src/realtime/container';

import { Inject, Injectable } from '@nestjs/common';

import type {
  ItemAddPayload,
  ItemRemovePayload,
  ManageBagPort,
} from '../../ports/actions/manage-bag.port';

@Injectable()
export class ManageBagUseCase implements ManageBagPort {
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
