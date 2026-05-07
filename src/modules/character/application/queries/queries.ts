import { FindCharacterByIdHandler } from './find-character-by-id/find-character-by-id.handler';
import { FindCharactersByUserIdHandler } from './find-characters-by-user-id/find-characters-by-user-id.handler';

export const queries = [FindCharacterByIdHandler, FindCharactersByUserIdHandler];
