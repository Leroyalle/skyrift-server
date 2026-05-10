import type { IQuest } from 'src/modules/quest';
import type { ILocation } from 'src/realtime/location';
import type { PlayerSessionSnapshot } from 'src/realtime/player-session';

import type { Interaction } from '../../domain/types/interaction.type';

export interface InteractionResolverPort {
  execute(
    character: PlayerSessionSnapshot,
    location: ILocation,
    interaction: Interaction,
  ): Promise<void | IQuest[]>;
}
