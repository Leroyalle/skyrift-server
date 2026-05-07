import type { CharacterSnapshot } from 'src/modules/character';
import type { IEffect } from 'src/modules/effect';
import type { IOwnedSkill } from 'src/modules/owned-skill';
import type { ISkill } from 'src/modules/skill';
import type { ConnectPlayerPayload } from 'src/realtime/player-session';
import type { ISkillSession } from 'src/realtime/skill-session';

export class PlayerConnectionMapper {
  public static toSessionProps(input: {
    character: CharacterSnapshot;
    skills: ISkill[];
    ownedSkills: IOwnedSkill[];
    effects: IEffect[];
  }): ConnectPlayerPayload {
    const skillById = new Map<string, ISkill>(input.skills.map(skill => [skill.id, skill]));

    const effectsBySkillId = new Map<string, IEffect[]>();

    for (const effect of input.effects) {
      const existing = effectsBySkillId.get(effect.skillId) ?? [];
      existing.push(effect);
      effectsBySkillId.set(effect.skillId, existing);
    }

    const ownedIdToSkillMap = new Map<string, ISkill>();
    const ownedSkillsMap = new Map<string, ISkillSession>();

    for (const ownedSkill of input.ownedSkills) {
      const skill = skillById.get(ownedSkill.skillId);
      if (!skill) continue;

      ownedIdToSkillMap.set(ownedSkill.id, skill);

      ownedSkillsMap.set(ownedSkill.id, {
        ...ownedSkill,
        skill: {
          ...skill,
          effects: effectsBySkillId.get(skill.id) ?? [],
        },
      });
    }

    return {
      ...input.character,
      skills: Array.from(ownedSkillsMap.values()),
    };
  }
}
