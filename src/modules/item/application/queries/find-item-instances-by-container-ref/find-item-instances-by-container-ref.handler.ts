import type { ItemInstanceRepositoryPort } from 'src/modules/item/domain/ports/item-instance-repository.port';
import type { ItemInstance } from 'src/modules/item/domain/types/item-instance.type';

import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ITEM_INSTANCE_REPOSITORY_TOKEN } from '../../ports/tokens';

import { FindItemInstancesByContainerRefQuery } from './find-item-instances-by-container-ref.query';

@QueryHandler(FindItemInstancesByContainerRefQuery)
export class FindItemInstancesByContainerRefHandler implements IQueryHandler<FindItemInstancesByContainerRefQuery> {
  constructor(
    @Inject(ITEM_INSTANCE_REPOSITORY_TOKEN) private readonly repository: ItemInstanceRepositoryPort,
  ) {}

  public async execute(query: FindItemInstancesByContainerRefQuery): Promise<ItemInstance[]> {
    return this.repository.findByContainer(query.props.containerId, query.props.containerType);
  }
}
