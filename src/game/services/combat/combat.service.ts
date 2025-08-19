import { Injectable } from '@nestjs/common';
import { PlayerStateService } from '../../player-state.service';
import { SkillType } from 'src/common/enums/skill/skill-type.enum';
import { PositionDto } from 'src/common/dto/position.dto';
import { SpatialGridService } from '../spatial-grid/spatial-grid.service';
import { LiveCharacterState } from 'src/character/types/live-character-state.type';
import { ActiveAoEZone } from './types/active-aoe-zone';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';
import { v4 as uuidv4 } from 'uuid';
import { EffectType } from 'src/common/enums/skill/effect-type.enum';

@Injectable()
export class CombatService {
  constructor(
    private readonly playerStateService: PlayerStateService,
    private readonly spatialGridService: SpatialGridService<LiveCharacterState>,
  ) {}

  private readonly activeAoEZones: ActiveAoEZone[] = [];

  applyAoESkill(attackerId: string, skillId: string, area: PositionDto) {
    const attacker = this.playerStateService.getCharacterState(attackerId);
    if (!attacker) return;

    const characterSkill = attacker.characterSkills.find(
      (skill) => skill.id === skillId,
    );

    if (!characterSkill) return;

    const areaRadius = characterSkill.skill.areaRadius;

    if (characterSkill.skill.type !== SkillType.AoE || !areaRadius) return;

    characterSkill.skill.effects?.forEach((effect) => {
      if (effect.type === EffectType.DamageOverTime) {
        this.spawnAoeZone(attacker, characterSkill, area);
      }
    });
  }

  spawnAoeZone(
    caster: LiveCharacterState,
    cSkill: CharacterSkill,
    area: PositionDto,
  ) {
    if (!cSkill.skill.areaRadius || !cSkill.skill.duration) return;

    const now = Date.now();

    this.activeAoEZones.push({
      casterId: caster.id,
      locationId: caster.locationId,
      skillId: cSkill.id,
      radius: cSkill.skill.areaRadius,
      x: area.x,
      y: area.y,
      id: uuidv4(),
      expiresAt: cSkill.skill.duration + now,
      effects: cSkill.skill.effects ?? [],
    });
  }
}
