import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CharacterClassService } from './character-class.service';
import { CharacterClass } from './entities/character-class.entity';
import { CreateCharacterClassInput } from './dto/create-character-class.input';
import { UpdateCharacterClassInput } from './dto/update-character-class.input';

@Resolver(() => CharacterClass)
export class CharacterClassResolver {
  constructor(private readonly characterClassService: CharacterClassService) {}

  @Mutation(() => CharacterClass)
  createCharacterClass(
    @Args('createCharacterClassInput')
    createCharacterClassInput: CreateCharacterClassInput,
  ) {
    return this.characterClassService.create(createCharacterClassInput);
  }

  @Query(() => [CharacterClass], { name: 'characterClass' })
  findAll() {
    return this.characterClassService.findAll();
  }

  @Query(() => CharacterClass, { name: 'characterClass' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.characterClassService.findOne(id);
  }

  @Mutation(() => CharacterClass)
  updateCharacterClass(
    @Args('updateCharacterClassInput')
    updateCharacterClassInput: UpdateCharacterClassInput,
  ) {
    return this.characterClassService.update(
      updateCharacterClassInput.id,
      updateCharacterClassInput,
    );
  }

  @Mutation(() => CharacterClass)
  removeCharacterClass(@Args('id', { type: () => Int }) id: number) {
    return this.characterClassService.remove(id);
  }
}
