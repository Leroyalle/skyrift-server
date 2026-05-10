import { IUser } from '../../domain/types/user.type';

export interface UserFacadePort {
  create(data: Pick<IUser, 'email' | 'password' | 'name'>): Promise<IUser>;
  findAll(): Promise<IUser[]>;
  findOne(id: IUser['id']): Promise<IUser | null>;
  findByEmail(email: IUser['email']): Promise<IUser | null>;
  update(id: string, data: Partial<IUser>): Promise<void>;
}
