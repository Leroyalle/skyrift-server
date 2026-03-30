export type IEntityType = 'player' | 'npc' | 'mob';
export type IEntityKey<T extends IEntityType = IEntityType> = `${T}_${string}`;

export interface IEntityRef {
  id: string;
  type: IEntityType;
}
