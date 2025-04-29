import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CharacterService } from './character.service';
import { Character } from './entities/character.entity';
import { CreateCharacterInput } from './dto/create-character.input';
import { UpdateCharacterInput } from './dto/update-character.input';

@Resolver(() => Character)
export class CharacterResolver {
  constructor(private readonly characterService: CharacterService) {}

  @Mutation(() => Character)
  createCharacter(@Args('createCharacterInput') createCharacterInput: CreateCharacterInput) {
    return this.characterService.create(createCharacterInput);
  }

  @Query(() => [Character], { name: 'character' })
  findAll() {
    return this.characterService.findAll();
  }

  @Query(() => Character, { name: 'character' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.characterService.findOne(id);
  }

  @Mutation(() => Character)
  updateCharacter(@Args('updateCharacterInput') updateCharacterInput: UpdateCharacterInput) {
    return this.characterService.update(updateCharacterInput.id, updateCharacterInput);
  }

  @Mutation(() => Character)
  removeCharacter(@Args('id', { type: () => Int }) id: number) {
    return this.characterService.remove(id);
  }
}
