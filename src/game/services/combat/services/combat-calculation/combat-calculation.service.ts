import { CharacterSkill } from 'src/characters/character/character-skill/entities/character-skill.entity';
import { EffectType } from 'src/common/enums/skill/effect-type.enum';
import { SkillType } from 'src/common/enums/skill/skill-type.enum';
import { toEntries } from 'src/common/lib/to-entries.lib';
import { IRuntimeEffect } from 'src/game/services/runtime-effect/types/runtime-effect.type';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { ActionType } from 'src/game/types/pending-actions.type';
import { isArmor } from 'src/item/guards/is-armor';
import { isWeapon } from 'src/item/guards/is-weapon';

import { Injectable } from '@nestjs/common';

type CalculateCombat = {
  attacker: TRuntimeEntity;
  victim: TRuntimeEntity;
} & (Auto | Skill | Effect);

type Auto = {
  source: ActionType.AutoAttack;
};

type Skill = {
  source: ActionType.Skill;
  skill: CharacterSkill;
};

type Effect = {
  source: ActionType.Effect;
  effect: IRuntimeEffect;
};

type ReturnValue = {
  remainingHp: number;
  receivedDamage: number;
};

type DamageType = 'physical' | 'magic';

@Injectable()
export class CombatCalculationService {
  public calculateCombat(data: CalculateCombat): ReturnValue | undefined {
    const { attacker, victim } = data;
    // TODO: передавать тип урона или брать из аттакера
    const damageType: DamageType = 'physical';

    // TODO: сначала проверить тип урона, потом бежать и собирать (либо возвращать и физ и деф статы)
    const result = this.getPowerAndDefense(attacker, victim, damageType);

    let attackerPower = result.attackerPower;
    const victimDefense = result.victimDefense;

    if (data.source === ActionType.Skill) {
      if (data.skill.skill.type === SkillType.Target) {
        attackerPower += data.skill.skill.damage;
      }
    }

    if (data.source === ActionType.Effect) {
      switch (data.effect.type) {
        case EffectType.DamageOverTime:
          if (!data.effect.damagePerSecond) return;
          attackerPower += data.effect.damagePerSecond;
          break;

        default:
          break;
      }
    }

    const victimDefenseHp = victim.hp + victimDefense;
    const remainingHp = Math.max(Math.min(victimDefenseHp - attackerPower, victim.maxHp), 0);

    return {
      remainingHp,
      receivedDamage: attackerPower,
    };
  }

  private getPowerAndDefense = (
    attacker: TRuntimeEntity,
    victim: TRuntimeEntity,
    damageType: DamageType,
  ) => {
    const victimDefense = toEntries(victim.equipment).reduce<number>(
      (acc, [, item]) => {
        if (!item || typeof item === 'string') return acc;
        if (!isArmor(item)) return acc;

        acc += damageType === 'physical' ? item.physicalDefense : item.magicDefense;
        return acc;
      },
      damageType === 'physical' ? victim.physicalDefense : victim.magicDefense,
    );

    const attackerPower = toEntries(attacker.equipment).reduce<number>(
      (acc, [, item]) => {
        if (!item || typeof item === 'string') return acc;
        if (!isWeapon(item)) return acc;
        acc += damageType === 'physical' ? item.physicalDamage : item.magicDamage;
        return acc;
      },
      damageType === 'physical' ? attacker.basePhysicalDamage : attacker.baseMagicDamage,
    );

    console.log('VICTIM DEFENSE', victimDefense);
    console.log('ATTACKER POWER', attackerPower);

    return {
      victimDefense,
      attackerPower,
    };
  };
}
