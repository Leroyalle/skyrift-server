import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { CharacterClass } from '../../domain/entities/character-class.entity';
import { CharacterClassRepositoryPort } from '../../domain/ports/character-class.repository';
import { ICharacterClass } from '../../domain/types/character-class.type';
import { ClassDescriptionVo } from '../../domain/vo/class-description.vo';
import { CharacterClassFacadePort } from '../ports/character-class-facade.port';
import { CHARACTER_CLASS_REPOSITORY } from '../ports/tokens';

@Injectable()
export class CharacterClassFacade implements CharacterClassFacadePort {
  constructor(
    @Inject(CHARACTER_CLASS_REPOSITORY)
    private readonly characterClassRepository: CharacterClassRepositoryPort,
  ) {}

  public async create(payload: Omit<ICharacterClass, 'id'>) {
    const characterClass = CharacterClass.create({
      id: randomUUID(),
      description: ClassDescriptionVo.create(payload.description),
      name: payload.name,
      logo: payload.logo,
      factionId: payload.factionId,
      skillsIds: payload.skillsIds,
    });

    const result = await this.characterClassRepository.create(characterClass);

    return result.snapshot();
  }
}
