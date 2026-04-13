import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import type { IOwnedSkill } from '../../domain/types/owned-skill.type';

export interface OwnedSkillFacadePort {
  findOwnedSkills(props: IEntityRef): Promise<IOwnedSkill[]>;
}
