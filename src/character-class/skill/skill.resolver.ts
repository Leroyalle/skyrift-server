import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateSkillInput } from './dto/create-skill.input';
import { UpdateSkillInput } from './dto/update-skill.input';
import { Skill } from './entities/skill.entity';
import { SkillService } from './skill.service';

@Resolver(() => Skill)
export class SkillResolver {
  constructor(private readonly skillService: SkillService) {}

  @Mutation(() => Skill)
  createSkill(@Args('createSkillInput') createSkillInput: CreateSkillInput) {
    return this.skillService.create(createSkillInput);
  }

  @Query(() => [Skill], { name: 'skill' })
  findAll() {
    return this.skillService.findAll();
  }

  @Query(() => Skill, { name: 'skill' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.skillService.findOne(id);
  }

  @Mutation(() => Skill)
  updateSkill(@Args('updateSkillInput') updateSkillInput: UpdateSkillInput) {
    return this.skillService.update(updateSkillInput.id, updateSkillInput);
  }

  @Mutation(() => Skill)
  removeSkill(@Args('id', { type: () => Int }) id: number) {
    return this.skillService.remove(id);
  }
}
