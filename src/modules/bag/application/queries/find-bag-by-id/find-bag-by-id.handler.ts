import { type IQueryHandler, QueryBus, QueryHandler } from '@nestjs/cqrs';

import { FindBagByIdQuery } from './find-bag-by-id.query';

@QueryHandler(FindBagByIdQuery)
export class FindBagByIdHandler implements IQueryHandler<FindBagByIdQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  public async execute(query: FindBagByIdQuery) {
    return this.queryBus.execute(new FindBagByIdQuery(query.id));
  }
}
