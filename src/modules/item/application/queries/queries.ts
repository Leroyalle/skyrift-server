import { FindItemInstancesByContainerRefHandler } from './find-item-instances-by-container-ref/find-item-instances-by-container-ref.handler';
import { FindItemInstancesByIdsHandler } from './find-item-instances-by-ids/find-item-instances-by-ids.handler';
import { FindItemTemplateByIdHandler } from './find-item-template-by-id/find-item-template-by-id.handler';
import { FindItemTemplateByIdsHandler } from './find-item-template-by-ids/find-item-template-by-ids.handler';

export const queries = [
  FindItemInstancesByContainerRefHandler,
  FindItemInstancesByIdsHandler,
  FindItemTemplateByIdHandler,
  FindItemTemplateByIdsHandler,
];
