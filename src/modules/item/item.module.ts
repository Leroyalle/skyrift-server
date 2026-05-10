import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ItemInstanceFacade } from './application/facades/item-instance.facade';
import { ItemTemplateFacade } from './application/facades/item-template.facade';
import {
  ITEM_INSTANCE_FACADE_TOKEN,
  ITEM_INSTANCE_REPOSITORY_TOKEN,
  ITEM_TEMPLATE_FACADE_TOKEN,
  ITEM_TEMPLATE_REPOSITORY_TOKEN,
} from './application/ports/tokens';
import { queries } from './application/queries/queries';
import { ItemInstanceOrmEntity } from './infrastructure/entities/item-instance-orm.entity';
import { ItemTemplateOrmEntity } from './infrastructure/entities/item-template-orm.entity';
import { ItemInstanceRepository } from './infrastructure/repositories/item-instance.repository';
import { ItemTemplateRepository } from './infrastructure/repositories/item-template.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ItemInstanceOrmEntity, ItemTemplateOrmEntity])],
  providers: [
    {
      provide: ITEM_INSTANCE_REPOSITORY_TOKEN,
      useClass: ItemInstanceRepository,
    },
    {
      provide: ITEM_TEMPLATE_REPOSITORY_TOKEN,
      useClass: ItemTemplateRepository,
    },
    {
      provide: ITEM_INSTANCE_FACADE_TOKEN,
      useClass: ItemInstanceFacade,
    },
    {
      provide: ITEM_TEMPLATE_FACADE_TOKEN,
      useClass: ItemTemplateFacade,
    },
    ...queries,
  ],
  exports: [ITEM_INSTANCE_FACADE_TOKEN, ITEM_TEMPLATE_FACADE_TOKEN],
})
export class ItemModule {}
