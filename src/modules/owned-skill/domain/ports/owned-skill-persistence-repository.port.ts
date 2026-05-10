import type { OwnedSkill } from '../entities/owned-skill.entity';

export interface OwnedSkillPersistenceRepositoryPort {
  save(domain: OwnedSkill): Promise<OwnedSkill>;
  remove(id: OwnedSkill['id']): Promise<void>;
  findBySkillId(skillId: OwnedSkill['skillId']): Promise<OwnedSkill[]>;
  findById(id: OwnedSkill['id']): Promise<OwnedSkill | null>;
  update(domain: OwnedSkill): Promise<void>;
  findByOwnerRef(ownerRef: OwnedSkill['ownerRef']): Promise<OwnedSkill[]>;
}
