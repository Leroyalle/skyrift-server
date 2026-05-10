import type { Interaction } from '../types/interaction.type';

export interface InteractionRepositoryPort {
  add(payload: Interaction): void;
  delete(characterId: string): void;
  get(characterId: string): Readonly<Interaction> | undefined;
  getIterable(): Iterable<Readonly<Interaction>>;
}
