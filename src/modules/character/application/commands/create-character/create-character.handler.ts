import { randomUUID } from 'crypto';
import { Appearance } from 'src/common/domain/vo/appearance.vo';
import { CHARACTER_CLASS_READER_TOKEN } from 'src/modules/character-class';
import { Character } from 'src/modules/character/domain/entities/character.entity';
import type { CharacterRepositoryPort } from 'src/modules/character/domain/ports/character-repository.port';
import { CLOCK_TOKEN, type ClockPort } from 'src/realtime/shared/infrastructure/time';

import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import type { CharacterClassReaderPort } from '../../../../character-class/application/ports/character-class-reader.port';
import { CharacterClientMapper } from '../../mappers/character-client.mapper';
import { CHARACTER_REPOSITORY_TOKEN } from '../../ports/tokens';

import { CreateCharacterCommand } from './create-character.command';

@CommandHandler(CreateCharacterCommand)
export class CreateCharacterHandler implements ICommandHandler<CreateCharacterCommand> {
  constructor(
    @Inject(CHARACTER_REPOSITORY_TOKEN)
    private readonly characterRepository: CharacterRepositoryPort,
    @Inject(CHARACTER_CLASS_READER_TOKEN)
    private readonly characterClassReader: CharacterClassReaderPort,
    @Inject(CLOCK_TOKEN) private readonly clockService: ClockPort,
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
      appearance: Appearance.create(command.props.appearance),
      id: randomUUID(),
      y: command.props.y,
      x: command.props.x,
      hp: command.props.hp,
      maxHp: command.props.maxHp,
      attackRange: command.props.attackRange,
      attackSpeed: command.props.attackSpeed,
      basePhysicalDamage: command.props.basePhysicalDamage,
      baseMagicDamage: command.props.baseMagicDamage,
      physicalDefense: command.props.physicalDefense,
      magicDefense: command.props.magicDefense,
      critMultiplier: command.props.critMultiplier,
      experienceToNextLevel: command.props.experienceToNextLevel,
      experience: command.props.experience,
      skillPoints: command.props.skillPoints,
      bagId: command.props.bagId,
      locationId: command.props.locationId,
      equipmentId: command.props.equipmentId,
      walkSpeed: command.props.walkSpeed,
      isAlive: command.props.hp > 0,
      questsIds: command.props.questsIds,
      createdAt: this.clockService.now(),
      isDeleted: false,
      level: command.props.level,
      skillsIds: command.props.skillsIds,
    });

    const result = await this.characterRepository.create(character);

    return CharacterClientMapper.toClient(result);
  }
}
