import { randomUUID } from 'crypto';
import { Character } from 'src/modules/character/domain/entities/character.entity';
import type { CharacterRepositoryPort } from 'src/modules/character/domain/ports/character-repository.port';

import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { CharacterClientMapper } from '../../mappers/character-client.mapper';
import type { CharacterClassReaderPort } from '../../ports/character-class-reader.port';
import { CHARACTER_CLASS_READER_TOKEN, CHARACTER_REPOSITORY_TOKEN } from '../../ports/tokens';

import { CreateCharacterCommand } from './create-character.command';

@CommandHandler(CreateCharacterCommand)
export class CreateCharacterHandler implements ICommandHandler<CreateCharacterCommand> {
  constructor(
    @Inject(CHARACTER_REPOSITORY_TOKEN)
    private readonly characterRepository: CharacterRepositoryPort,
    @Inject(CHARACTER_CLASS_READER_TOKEN)
    private readonly characterClassReader: CharacterClassReaderPort,
  ) {}

  public async execute(command: CreateCharacterCommand) {
    const characterClass = await this.characterClassReader.findById(command.props.classId);

    if (!characterClass) {
      throw new Error('Character class not found');
    }

    const character = Character.create({
      userId: command.props.userId,
      classId: command.props.classId,
      name: command.props.name,
      appearance: command.props.appearance,
      id: randomUUID(),
    });

    const result = await this.characterRepository.create(character);

    return CharacterClientMapper.toClient(result);
  }
}
