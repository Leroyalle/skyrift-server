import { Repository } from 'typeorm';

import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Effect } from './entities/effect.entity';
import { generateEffectKey } from './lib/generate-effect-key.lib';
import { EffectKey } from './types/effect-key.type';
import { EffectRef } from './types/effect-ref.type';

@Injectable()
export class EffectService implements OnModuleInit {
  constructor(
    @InjectRepository(Effect)
    private readonly effectRepository: Repository<Effect>,
  ) {}

  private readonly effectsMapById: Map<string, Effect> = new Map();
  private readonly effectsMapByTypeDuration: Map<EffectKey, Effect> = new Map();

  public async onModuleInit(): Promise<void> {
    const effects = await this.effectRepository.find();
    effects.forEach(e => {
      this.effectsMapById.set(e.id, e);
      this.effectsMapByTypeDuration.set(generateEffectKey(e), e);
    });
  }

  public getEffectById(id: string): Effect | undefined {
    return this.effectsMapById.get(id);
  }

  public getEffectByType(ref: EffectRef): Effect | undefined {
    return this.effectsMapByTypeDuration.get(generateEffectKey(ref));
  }
}
