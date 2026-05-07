import { randomUUID } from 'node:crypto';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Inject, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { BagRepositoryPort } from '../../domain/ports/bag-repository.port';
import type { IBag } from '../../domain/types/bag.type';
import type { BagFacadePort } from '../ports/bag-facade.port';
import { BAG_REPOSITORY_TOKEN } from '../ports/tokens';
import { FindBagByIdQuery } from '../queries/find-bag-by-id/find-bag-by-id.query';
import { FindBagByOwnerRefQuery } from '../queries/find-bag-by-owner-ref/find-bag-by-owner-ref.query';

@Injectable()
export class BagFacade implements BagFacadePort {
  constructor(
    private readonly queryBus: QueryBus,
    @Inject(BAG_REPOSITORY_TOKEN) private readonly repository: BagRepositoryPort,
  ) {}
  public getByOwner(ownerRef: IEntityRef) {
    return this.queryBus.execute<FindBagByOwnerRefQuery, IBag | null>(
      new FindBagByOwnerRefQuery(ownerRef),
    );
  }

  public getById(id: IBag['id']): Promise<IBag | null> {
    return this.queryBus.execute(new FindBagByIdQuery(id));
  }

  public create(bag: Omit<IBag, 'id'>): Promise<IBag> {
    return this.repository.save({ id: randomUUID(), ...bag });
  }

  public async delete(id: IBag['id']): Promise<void> {
    await this.repository.remove(id);
  }
}
