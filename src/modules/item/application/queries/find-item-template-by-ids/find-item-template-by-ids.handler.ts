import type { ItemTemplateRepositoryPort } from 'src/modules/item/domain/ports/item-template-repository.port';

import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ITEM_TEMPLATE_REPOSITORY_TOKEN } from '../../ports/tokens';

import { FindItemTemplateByIdsQuery } from './find-item-template-by-ids.query';

@QueryHandler(FindItemTemplateByIdsQuery)
export class FindItemTemplateByIdsHandler implements IQueryHandler<FindItemTemplateByIdsQuery> {
  constructor(
    @Inject(ITEM_TEMPLATE_REPOSITORY_TOKEN) private readonly repository: ItemTemplateRepositoryPort,
  ) {}

  public async execute(query: FindItemTemplateByIdsQuery) {
    return this.repository.findByIds(query.ids);
  }
}
