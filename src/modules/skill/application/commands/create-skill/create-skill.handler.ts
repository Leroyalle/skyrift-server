import { randomUUID } from 'node:crypto';
import { Skill } from 'src/modules/skill/domain/entities/skill.entity';
import type { SkillPersistenceRepositoryPort } from 'src/modules/skill/domain/ports/skill-persistence-repository.port';
import { ISkill } from 'src/modules/skill/domain/types/skill.type';

import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { SKILL_PERSISTENCE_REPOSITORY_TOKEN } from '../../ports/tokens';

import { CreateSkillCommand } from './create-skill.command';

@CommandHandler(CreateSkillCommand)
export class CreateSkillHandler implements ICommandHandler<CreateSkillCommand> {
  constructor(
    @Inject(SKILL_PERSISTENCE_REPOSITORY_TOKEN)
    private readonly skillPersistenceRepository: SkillPersistenceRepositoryPort,
  ) {}

  public async execute(command: CreateSkillCommand): Promise<ISkill> {
    const skill = Skill.create({
      classId: command.props.classId,
      visualEffects: command.props.visualEffects,
      extraParams: command.props.extraParams,
      duration: command.props.duration,
      damagePerSecond: command.props.damagePerSecond,
      areaRadius: command.props.areaRadius,
      type: command.props.type,
      tilesetKey: command.props.tilesetKey,
      range: command.props.range,
      name: command.props.name,
      manaCost: command.props.manaCost,
      id: randomUUID(),
      icon: command.props.icon,
      heal: command.props.heal,
      damage: command.props.damage,
      cooldownMs: command.props.cooldownMs,
    });

    const result = await this.skillPersistenceRepository.save(skill);

    return result.snapshot();
  }
}
