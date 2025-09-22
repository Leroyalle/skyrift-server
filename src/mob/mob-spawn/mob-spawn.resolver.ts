import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MobSpawnService } from './mob-spawn.service';
import { MobSpawn } from './entities/mob-spawn.entity';
import { CreateMobSpawnInput } from './dto/create-mob-spawn.input';
import { UpdateMobSpawnInput } from './dto/update-mob-spawn.input';

@Resolver(() => MobSpawn)
export class MobSpawnResolver {
  constructor(private readonly mobSpawnService: MobSpawnService) {}
}
