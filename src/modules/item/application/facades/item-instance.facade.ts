import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { ItemInstanceRepositoryPort } from '../../domain/ports/item-instance-repository.port';
import type { ItemInstance } from '../../domain/types/item-instance.type';
import type { ItemInstanceFacadePort } from '../ports/item-instance-facade.port';
import { ITEM_INSTANCE_REPOSITORY_TOKEN } from '../ports/tokens';
import { FindItemInstancesByContainerRefQuery } from '../queries/find-item-instances-by-container-ref/find-item-instances-by-container-ref.query';
import { FindItemInstancesByIdsQuery } from '../queries/find-item-instances-by-ids/find-item-instances-by-ids.query';

@Injectable()
export class ItemInstanceFacade implements ItemInstanceFacadePort {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(ITEM_INSTANCE_REPOSITORY_TOKEN)
    private readonly itemInstanceRepository: ItemInstanceRepositoryPort,
  ) {}

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

  public create(item: Omit<ItemInstance, 'id'>): Promise<ItemInstance> {
    return this.itemInstanceRepository.save({ id: randomUUID(), ...item });
  }

  public async delete(id: ItemInstance['id']): Promise<void> {
    await this.itemInstanceRepository.delete(id);
  }
}
