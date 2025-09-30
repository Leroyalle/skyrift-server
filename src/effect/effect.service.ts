import { Injectable, OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Effect } from './entities/effect.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class EffectService implements OnModuleInit {
  constructor(
    @InjectRepository(Effect)
    private readonly effectRepository: Repository<Effect>,
  ) {}

  private readonly effectsMap: Map<string, Effect> = new Map();

  async onModuleInit() {
    const effects = await this.effectRepository.find();
    effects.forEach((e) => this.effectsMap.set(e.id, e));
  }
}
