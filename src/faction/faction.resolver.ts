import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateFactionInput } from './dto/create-faction.input';
import { UpdateFactionInput } from './dto/update-faction.input';
import { Faction } from './entities/faction.entity';
import { FactionService } from './faction.service';

@Resolver(() => Faction)
export class FactionResolver {
  constructor(private readonly factionService: FactionService) {}

  @Mutation(() => Faction)
  createFaction(@Args('createFactionInput') createFactionInput: CreateFactionInput) {
    return this.factionService.create(createFactionInput);
  }

  @Query(() => [Faction], { name: 'faction' })
  findAll() {
    return this.factionService.findAll();
  }

  @Query(() => Faction, { name: 'faction' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.factionService.findOne(id);
  }

  @Mutation(() => Faction)
  updateFaction(@Args('updateFactionInput') updateFactionInput: UpdateFactionInput) {
    return this.factionService.update(updateFactionInput.id, updateFactionInput);
  }

  @Mutation(() => Faction)
  removeFaction(@Args('id', { type: () => Int }) id: number) {
    return this.factionService.remove(id);
  }
}
