import { Module } from '@nestjs/common';
import { EffectService } from './effect.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Effect } from './entities/effect.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Effect])],
  providers: [EffectService],
  exports: [EffectService],
})
export class EffectModule {}
