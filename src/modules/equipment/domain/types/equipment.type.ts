import { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export interface IEquipment {
  id: string;
  ownerRef: IEntityRef;
  helmetId: string | null;
  breastplateId: string | null;
  glovesId: string | null;
  legsId: string | null;
  mainHandId: string | null;
  offHandId: string | null;
  ring1Id: string | null;
  ring2Id: string | null;
  cloakId: string | null;
}
