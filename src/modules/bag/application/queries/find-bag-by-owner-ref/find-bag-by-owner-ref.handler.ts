import type { BagRepositoryPort } from 'src/modules/bag/domain/ports/bag-repository.port';

import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { BAG_REPOSITORY_TOKEN } from '../../ports/tokens';

import { FindBagByOwnerRefQuery } from './find-bag-by-owner-ref.query';

@QueryHandler(FindBagByOwnerRefQuery)
export class FindBagByOwnerRefHandler implements IQueryHandler<FindBagByOwnerRefQuery> {
  constructor(@Inject(BAG_REPOSITORY_TOKEN) private readonly bagRepository: BagRepositoryPort) {}

  public async execute(query: FindBagByOwnerRefQuery) {
    return this.bagRepository.getByOwner(query.ownerRef);
  }
}
