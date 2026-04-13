import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import type { ItemTemplate } from '../../domain/types/item-template.type';
import type { ItemTemplateFacadePort } from '../ports/item-template-facade.port';
import { FindItemTemplateByIdQuery } from '../queries/find-item-template-by-id/find-item-template-by-id.query';
import { FindItemTemplateByIdsQuery } from '../queries/find-item-template-by-ids/find-item-template-by-ids.query';

@Injectable()
export class ItemTemplateFacade implements ItemTemplateFacadePort {
  constructor(private readonly queryBus: QueryBus) {}

  public async findById(id: string): Promise<ItemTemplate | null> {
    return this.queryBus.execute(new FindItemTemplateByIdQuery(id));
  }

  public async findByIds(ids: string[]): Promise<ItemTemplate[]> {
    return this.queryBus.execute(new FindItemTemplateByIdsQuery(ids));
  }
}
