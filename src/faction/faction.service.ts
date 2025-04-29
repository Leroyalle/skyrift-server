import { Injectable } from '@nestjs/common';
import { CreateFactionInput } from './dto/create-faction.input';
import { UpdateFactionInput } from './dto/update-faction.input';

@Injectable()
export class FactionService {
  create(createFactionInput: CreateFactionInput) {
    return 'This action adds a new faction';
  }

  findAll() {
    return `This action returns all faction`;
  }

  findOne(id: number) {
    return `This action returns a #${id} faction`;
  }

  update(id: number, updateFactionInput: UpdateFactionInput) {
    return `This action updates a #${id} faction`;
  }

  remove(id: number) {
    return `This action removes a #${id} faction`;
  }
}
