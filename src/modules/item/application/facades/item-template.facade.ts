import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { ItemTemplateRepositoryPort } from '../../domain/ports/item-template-repository.port';
import type { ItemTemplate } from '../../domain/types/item-template.type';
import type { ItemTemplateFacadePort } from '../ports/item-template-facade.port';
import { ITEM_TEMPLATE_REPOSITORY_TOKEN } from '../ports/tokens';
import { FindItemTemplateByIdQuery } from '../queries/find-item-template-by-id/find-item-template-by-id.query';
import { FindItemTemplateByIdsQuery } from '../queries/find-item-template-by-ids/find-item-template-by-ids.query';

@Injectable()
export class ItemTemplateFacade implements ItemTemplateFacadePort {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(ITEM_TEMPLATE_REPOSITORY_TOKEN) private readonly repository: ItemTemplateRepositoryPort,
  ) {}

  public async findById(id: string): Promise<ItemTemplate | null> {
    return this.queryBus.execute(new FindItemTemplateByIdQuery(id));
  }

  public async findByIds(ids: string[]): Promise<ItemTemplate[]> {
    return this.queryBus.execute(new FindItemTemplateByIdsQuery(ids));
  }

  public create(item: Omit<ItemTemplate, 'id'>): Promise<ItemTemplate> {
    return this.repository.save({ id: randomUUID(), ...item });
  }

  public async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
