import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CharacterSkillService } from './character-skill.service';
import { CreateCharacterSkillInput } from './dto/create-character-skill.input';
import { UpdateCharacterSkillInput } from './dto/update-character-skill.input';
import { CharacterSkill } from './entities/character-skill.entity';

@Resolver(() => CharacterSkill)
export class CharacterSkillResolver {
  constructor(private readonly characterSkillService: CharacterSkillService) {}

  @Mutation(() => CharacterSkill)
  createCharacterSkill(
    @Args('createCharacterSkillInput')
    createCharacterSkillInput: CreateCharacterSkillInput,
  ) {
    return this.characterSkillService.create(createCharacterSkillInput);
  }

  @Query(() => [CharacterSkill], { name: 'characterSkill' })
  findAll() {
    return this.characterSkillService.findAll();
  }

  @Query(() => CharacterSkill, { name: 'characterSkill' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.characterSkillService.findOne(id);
  }

  @Mutation(() => CharacterSkill)
  updateCharacterSkill(
    @Args('updateCharacterSkillInput')
    updateCharacterSkillInput: UpdateCharacterSkillInput,
  ) {
    return this.characterSkillService.update(
      updateCharacterSkillInput.id,
      updateCharacterSkillInput,
    );
  }

  @Mutation(() => CharacterSkill)
  removeCharacterSkill(@Args('id', { type: () => Int }) id: number) {
    return this.characterSkillService.remove(id);
  }
}
