import { randomUUID } from 'crypto';
import { CharacterClass } from 'src/modules/character-class/domain/entities/character-class.entity';
import type { CharacterClassRepositoryPort } from 'src/modules/character-class/domain/ports/character-class.repository';
import { ClassDescriptionVo } from 'src/modules/character-class/domain/vo/class-description.vo';

import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { CharacterClassClientMapper } from '../../mappers/character-class-client.mapper';
import { CHARACTER_CLASS_REPOSITORY } from '../../ports/tokens';

import { CreateCharacterClassCommand } from './create-character-class.command';

@CommandHandler(CreateCharacterClassCommand)
export class CreateCharacterClassHandler implements ICommandHandler<CreateCharacterClassCommand> {
  constructor(
    @Inject(CHARACTER_CLASS_REPOSITORY)
    private readonly characterClassRepository: CharacterClassRepositoryPort,
  ) {}

  public async execute(command: CreateCharacterClassCommand) {
    const entity = CharacterClass.create({
      description: ClassDescriptionVo.create(command.props.description),
      name: command.props.name,
      logo: command.props.logo,
      factionId: command.props.factionId,
      skillsIds: command.props.skillsIds,
      id: randomUUID(),
    });

    await this.characterClassRepository.create(entity);

    return CharacterClassClientMapper.toClient(entity);
  }
}
