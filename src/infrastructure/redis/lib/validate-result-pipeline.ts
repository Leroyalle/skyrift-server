import { parseLiveCharacterState } from 'src/game/lib/parse-live-character-state.lib';

export const validateResultPipeline = (result: [Error | null, unknown][]) => {
  return result
    .filter(([e]) => !e)
    .map(([_, p]) => parseLiveCharacterState(p as Record<string, string>));
};
