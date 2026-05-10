import { User } from '../entities/user.entity';

export interface UserRepositoryPort {
  create(user: User): Promise<User>;
  findAll(): Promise<User[]>;
  findOne(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<void>;
}
