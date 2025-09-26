import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class Timestamp {
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
