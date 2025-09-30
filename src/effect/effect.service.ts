import { Injectable, OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Effect } from './entities/effect.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EffectType } from 'src/common/enums/skill/effect-type.enum';

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

  public getEffectById(id: string): Effect | undefined {
    return this.effectsMap.get(id);
  }

  public getEffectsByType(type: EffectType): Effect[] {
    const effects: Effect[] = [];

    this.effectsMap.forEach((e) => {
      if (e.type === type) {
        effects.push(e);
      }
    });

    return effects;
  }
}
