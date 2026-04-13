import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import type { ItemInstance } from '../../domain/types/item-instance.type';
import type { ItemInstanceFacadePort } from '../ports/item-instance-facade.port';
import { FindItemInstancesByContainerRefQuery } from '../queries/find-item-instances-by-container-ref/find-item-instances-by-container-ref.query';
import { FindItemInstancesByIdsQuery } from '../queries/find-item-instances-by-ids/find-item-instances-by-ids.query';
import { FindItemInstancesByOwnerRefQuery } from '../queries/find-item-instances-by-owner-ref/find-item-instances-by-owner-ref.query';

@Injectable()
export class ItemInstanceFacade implements ItemInstanceFacadePort {
  constructor(private readonly queryBus: QueryBus) {}

  public findByOwnerRef(
    ownerId: ItemInstance['ownerId'],
    ownerType: ItemInstance['ownerType'],
  ): Promise<ItemInstance[]> {
    return this.queryBus.execute(
      new FindItemInstancesByOwnerRefQuery({ id: ownerId, type: ownerType }),
    );
  }

  public findByContainerRef(
    containerId: ItemInstance['containerId'],
    containerType: ItemInstance['containerType'],
  ): Promise<ItemInstance[]> {
    return this.queryBus.execute(
      new FindItemInstancesByContainerRefQuery({ containerId, containerType }),
    );
  }

  public findByIds(ids: ItemInstance['id'][]): Promise<ItemInstance[]> {
    return this.queryBus.execute(new FindItemInstancesByIdsQuery(ids));
  }
}
