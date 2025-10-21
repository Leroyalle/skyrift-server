import { Injectable } from '@nestjs/common';
import { CreateBagInput } from './dto/create-bag.input';
import { UpdateBagInput } from './dto/update-bag.input';

@Injectable()
export class BagService {
  create(createBagInput: CreateBagInput) {
    return 'This action adds a new bag';
  }

  findAll() {
    return `This action returns all bag`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bag`;
  }

  update(id: number, updateBagInput: UpdateBagInput) {
    return `This action updates a #${id} bag`;
  }

  remove(id: number) {
    return `This action removes a #${id} bag`;
  }
}
