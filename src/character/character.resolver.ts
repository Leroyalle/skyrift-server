import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CharacterService } from './character.service';
import { Character } from './entities/character.entity';
import { CreateCharacterInput } from './dto/create-character.input';
import { UpdateCharacterInput } from './dto/update-character.input';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { PayloadUser } from 'src/common/types/user-request.type';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';

@Resolver(() => Character)
export class CharacterResolver {
  constructor(private readonly characterService: CharacterService) {}

  @Mutation(() => Character)
  public createCharacter(@Args('createCharacterInput') createCharacterInput: CreateCharacterInput) {
    return this.characterService.create(createCharacterInput);
  }

  @UseGuards(AccessTokenGuard)
  @Query(() => [Character], { name: 'findUserCharacters' })
  public findUserCharacters(@CurrentUser() user: PayloadUser) {
    return this.characterService.findUserCharacters(user.sub);
  }

  @Mutation(() => Character)
  public updateCharacter(@Args('updateCharacterInput') updateCharacterInput: UpdateCharacterInput) {
    return this.characterService.update(updateCharacterInput.id, updateCharacterInput);
  }

  @Mutation(() => Character)
  public removeCharacter(@Args('id', { type: () => Int }) id: number) {
    return this.characterService.remove(id);
  }
}
