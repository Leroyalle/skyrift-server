import { FindBagByIdHandler } from './find-bag-by-id/find-bag-by-id.handler';
import { FindBagByOwnerRefHandler } from './find-bag-by-owner-ref/find-bag-by-owner-ref.handler';

export const queries = [FindBagByIdHandler, FindBagByOwnerRefHandler];
