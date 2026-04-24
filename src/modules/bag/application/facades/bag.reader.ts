import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import type { IBag } from '../../domain/types/bag.type';
import type { BagReaderPort } from '../ports/bag-reader.port';
import { FindBagByIdQuery } from '../queries/find-bag-by-id/find-bag-by-id.query';
import { FindBagByOwnerRefQuery } from '../queries/find-bag-by-owner-ref/find-bag-by-owner-ref.query';

@Injectable()
export class BagReader implements BagReaderPort {
  constructor(private readonly queryBus: QueryBus) {}
  public getByOwner(ownerRef: IEntityRef) {
    return this.queryBus.execute<FindBagByOwnerRefQuery, IBag | null>(
      new FindBagByOwnerRefQuery(ownerRef),
    );
  }

  public getById(id: IBag['id']): Promise<IBag | null> {
    return this.queryBus.execute(new FindBagByIdQuery(id));
  }
}
