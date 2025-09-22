import { Resolver } from '@nestjs/graphql';
import { MobService } from './mob.service';
import { Mob } from './entities/mob.entity';

@Resolver(() => Mob)
export class MobResolver {
  constructor(private readonly mobService: MobService) {}
}
