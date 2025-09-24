import { EntityType } from '../entity-type.type';

export type EntityKey<T extends EntityType = EntityType> = `${T}_${string}`;
