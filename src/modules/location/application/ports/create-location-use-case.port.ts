import { ILocation } from '../../domain/types/location.type';

export interface CreateLocationUseCasePort {
  execute(payload: ILocation): Promise<ILocation>;
}
