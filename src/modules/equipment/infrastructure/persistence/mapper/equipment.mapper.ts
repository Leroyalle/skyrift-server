import { IEquipment } from 'src/modules/equipment/domain/types/equipment.type';

import { EquipmentOrmEntity } from '../entities/equipment-orm.entity';

export class EquipmentMapper {
  public static toDomain(persistence: EquipmentOrmEntity): IEquipment {
    return {
      breastplateId: persistence.breastplateId,
      cloakId: persistence.cloakId,
      glovesId: persistence.glovesId,
      helmetId: persistence.helmetId,
      id: persistence.id,
      legsId: persistence.legsId,
      mainHandId: persistence.mainHandId,
      offHandId: persistence.offHandId,
      ownerRef: { id: persistence.ownerId, type: persistence.ownerType },
      ring1Id: persistence.ring1Id,
      ring2Id: persistence.ring2Id,
    };
  }
  public static toPersistence(domain: IEquipment): EquipmentOrmEntity {
    return {
      breastplateId: domain.breastplateId,
      cloakId: domain.cloakId,
      glovesId: domain.glovesId,
      helmetId: domain.helmetId,
      id: domain.id,
      legsId: domain.legsId,
      mainHandId: domain.mainHandId,
      offHandId: domain.offHandId,
      ownerId: domain.ownerRef.id,
      ownerType: domain.ownerRef.type,
      ring1Id: domain.ring1Id,
      ring2Id: domain.ring2Id,
    };
  }
}
