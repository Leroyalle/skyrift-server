import { Injectable } from '@nestjs/common';
import { CreateMobSpawnInput } from './dto/create-mob-spawn.input';
import { UpdateMobSpawnInput } from './dto/update-mob-spawn.input';

@Injectable()
export class MobSpawnService {
  create(createMobSpawnInput: CreateMobSpawnInput) {
    return 'This action adds a new mobSpawn';
  }

  findAll() {
    return `This action returns all mobSpawn`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mobSpawn`;
  }

  update(id: number, updateMobSpawnInput: UpdateMobSpawnInput) {
    return `This action updates a #${id} mobSpawn`;
  }

  remove(id: number) {
    return `This action removes a #${id} mobSpawn`;
  }
}
