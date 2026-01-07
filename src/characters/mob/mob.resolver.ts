import { Resolver } from '@nestjs/graphql';

import { Mob } from './entities/mob.entity';
import { MobService } from './mob.service';

@Resolver(() => Mob)
export class MobResolver {
  constructor(private readonly mobService: MobService) {}
}
