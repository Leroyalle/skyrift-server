import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { PayloadUser } from 'src/common/types/user-request.type';

import { Inject, UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { FindUserCharactersWithClassPort } from '../../application/ports/find-user-characters-with-class.port';
import { FIND_USER_CHARACTERS_WITH_CLASS_USE_CASE_TOKEN } from '../../application/ports/tokens';
import { CharacterPresentationMapper } from '../mappers/character-presentation.mapper';
import { CharacterModel } from '../models/character.model';

@Resolver()
export class CharacterGraphqlController {
  constructor(
    @Inject(FIND_USER_CHARACTERS_WITH_CLASS_USE_CASE_TOKEN)
    private readonly findUserCharactersWithClassUseCase: FindUserCharactersWithClassPort,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Query(() => [CharacterModel], { name: 'findUserCharacters' })
  public async findUserCharacters(@CurrentUser() user: PayloadUser) {
    const result = await this.findUserCharactersWithClassUseCase.execute(user.id);
    return result.map(CharacterPresentationMapper.toModel);
  }
}
