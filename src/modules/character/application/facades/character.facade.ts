import { Appearance } from 'src/common/domain/vo/appearance.vo';

import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { Character } from '../../domain/entities/character.entity';
import { CharacterRepositoryPort } from '../../domain/ports/character-repository.port';
import { CharacterSnapshot } from '../../domain/types/character.type';
import { CreateCharacterCommand } from '../commands/create-character/create-character.command';
import type { CharacterFacadePort } from '../ports/character-facade.port';
import { CHARACTER_REPOSITORY_TOKEN } from '../ports/tokens';
import { FindCharacterByIdQuery } from '../queries/find-character-by-id/find-character-by-id.query';

@Injectable()
export class CharacterFacade implements CharacterFacadePort {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @Inject(CHARACTER_REPOSITORY_TOKEN)
    private readonly characterRepository: CharacterRepositoryPort,
  ) {}

  public findById(userId: string, characterId: string) {
    return this.queryBus.execute(new FindCharacterByIdQuery({ userId, characterId }));
  }

  public create(character: Omit<CharacterSnapshot, 'id'>): Promise<CharacterSnapshot> {
    return this.commandBus.execute(new CreateCharacterCommand(character));
  }

  public async update(
    id: CharacterSnapshot['id'],
    payload: Partial<Omit<CharacterSnapshot, 'id'>>,
  ): Promise<void> {
    const character = await this.characterRepository.findById(id);
    if (!character) throw new Error('Character not found');

    const snapshot = character.snapshot();

    const domain = Character.create({
      attackRange: payload.attackRange ?? snapshot.attackRange,
      attackSpeed: payload.attackSpeed ?? snapshot.attackSpeed,
      bagId: payload.bagId ?? snapshot.bagId,
      baseMagicDamage: payload.baseMagicDamage ?? snapshot.baseMagicDamage,
      basePhysicalDamage: payload.basePhysicalDamage ?? snapshot.basePhysicalDamage,
      classId: payload.classId ?? snapshot.classId,
      critMultiplier: payload.critMultiplier ?? snapshot.critMultiplier,
      equipmentId: payload.equipmentId ?? snapshot.equipmentId,
      experience: payload.experience ?? snapshot.experience,
      experienceToNextLevel: payload.experienceToNextLevel ?? snapshot.experienceToNextLevel,
      hp: payload.hp ?? snapshot.hp,
      isAlive: payload.isAlive ?? snapshot.isAlive,
      isDeleted: payload.isDeleted ?? snapshot.isDeleted,
      level: payload.level ?? snapshot.level,
      locationId: payload.locationId ?? snapshot.locationId,
      magicDefense: payload.magicDefense ?? snapshot.magicDefense,
      maxHp: payload.maxHp ?? snapshot.maxHp,
      name: payload.name ?? snapshot.name,
      physicalDefense: payload.physicalDefense ?? snapshot.physicalDefense,
      questsIds: payload.questsIds ?? snapshot.questsIds,
      skillPoints: payload.skillPoints ?? snapshot.skillPoints,
      skillsIds: payload.skillsIds ?? snapshot.skillsIds,
      userId: payload.userId ?? snapshot.userId,
      walkSpeed: payload.walkSpeed ?? snapshot.walkSpeed,
      x: payload.x ?? snapshot.x,
      y: payload.y ?? snapshot.y,
      id,
      createdAt: snapshot.createdAt,
      appearance: payload.appearance
        ? Appearance.create(payload.appearance)
        : Appearance.create(snapshot.appearance),
    });

    await this.characterRepository.update(domain);
  }

  public delete(characterId: string): Promise<void> {
    return this.characterRepository.remove(characterId);
  }
}
