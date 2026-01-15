import { Equipment } from 'src/equipment/entities/equipment.entity';

type TEquipmentRelations = Record<keyof Omit<Equipment, 'id'>, boolean>;

export const equipmentRelations: TEquipmentRelations = {
  ring2: true,
  ring1: true,
  mainHand: true,
  offHand: true,
  legs: true,
  helmet: true,
  breastplate: true,
  cloak: true,
  gloves: true,
} as const;
