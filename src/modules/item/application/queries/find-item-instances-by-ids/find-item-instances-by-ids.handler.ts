import type { ItemInstanceRepositoryPort } from 'src/modules/item/domain/ports/item-instance-repository.port';

import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ITEM_INSTANCE_REPOSITORY_TOKEN } from '../../ports/tokens';

import { FindItemInstancesByIdsQuery } from './find-item-instances-by-ids.query';

@QueryHandler(FindItemInstancesByIdsQuery)
export class FindItemInstancesByIdsHandler implements IQueryHandler<FindItemInstancesByIdsQuery> {
  constructor(
    @Inject(ITEM_INSTANCE_REPOSITORY_TOKEN)
    private readonly itemInstanceRepository: ItemInstanceRepositoryPort,
  ) {}

  public async execute(query: FindItemInstancesByIdsQuery) {
    return this.itemInstanceRepository.findByIds(query.ids);
  }
}
