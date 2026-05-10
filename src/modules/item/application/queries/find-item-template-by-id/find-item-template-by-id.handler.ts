import type { ItemTemplateRepositoryPort } from 'src/modules/item/domain/ports/item-template-repository.port';

import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ITEM_TEMPLATE_REPOSITORY_TOKEN } from '../../ports/tokens';

import { FindItemTemplateByIdQuery } from './find-item-template-by-id.query';

@QueryHandler(FindItemTemplateByIdQuery)
export class FindItemTemplateByIdHandler implements IQueryHandler<FindItemTemplateByIdQuery> {
  constructor(
    @Inject(ITEM_TEMPLATE_REPOSITORY_TOKEN) private readonly repository: ItemTemplateRepositoryPort,
  ) {}

  public async execute(query: FindItemTemplateByIdQuery) {
    return this.repository.find(query.id);
  }
}
