export type IEntityType = 'player' | 'npc' | 'mob';
export type IEntityKey<T extends IEntityType = IEntityType> = `${T}_${string}`;

export interface IEntityRef<T extends IEntityType = IEntityType> {
  id: string;
  type: T;
}
