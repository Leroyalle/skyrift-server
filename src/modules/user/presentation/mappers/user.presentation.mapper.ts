import { IUser } from '../../domain/types/user.type';
import { UserModel } from '../models/user.model';

export class UserPresentationMapper {
  public static toModel = (data: IUser): UserModel => {
    return {
      email: data.email,
      createdAt: data.createdAt,
      id: data.id,
      name: data.name,
      password: data.password,
      updatedAt: data.updatedAt,
    };
  };
}
