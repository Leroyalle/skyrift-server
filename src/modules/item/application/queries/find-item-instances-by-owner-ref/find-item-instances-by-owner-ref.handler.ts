import type { ItemInstanceRepositoryPort } from 'src/modules/item/domain/ports/item-instance-repository.port';
import type { ItemInstance } from 'src/modules/item/domain/types/item-instance.type';

import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ITEM_INSTANCE_REPOSITORY_TOKEN } from '../../ports/tokens';

import { FindItemInstancesByOwnerRefQuery } from './find-item-instances-by-owner-ref.query';

@QueryHandler(FindItemInstancesByOwnerRefQuery)
export class FindItemInstancesByOwnerRefHandler implements IQueryHandler<FindItemInstancesByOwnerRefQuery> {
  constructor(
    @Inject(ITEM_INSTANCE_REPOSITORY_TOKEN) private readonly repository: ItemInstanceRepositoryPort,
  ) {}

  public async execute(query: FindItemInstancesByOwnerRefQuery): Promise<ItemInstance[]> {
    return this.repository.findByOwner(query.props.id, query.props.type);
  }
}
