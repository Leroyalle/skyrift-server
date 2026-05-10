import { BagRepositoryPort } from 'src/modules/bag/domain/ports/bag-repository.port';

import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';

import { BAG_REPOSITORY_TOKEN } from '../../ports/tokens';

import { FindBagByIdQuery } from './find-bag-by-id.query';

@QueryHandler(FindBagByIdQuery)
export class FindBagByIdHandler implements IQueryHandler<FindBagByIdQuery> {
  constructor(@Inject(BAG_REPOSITORY_TOKEN) private readonly bagRepository: BagRepositoryPort) {}

  public execute(query: FindBagByIdQuery) {
    return this.bagRepository.get(query.id);
  }
}
