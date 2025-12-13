import { CharacterMovementQueue, MobMovementQueue } from './movement-queue.type';

export type SetMovementQueueData = SetCharacterMovementQueue | SetMobMovementQueue;

type SetCharacterMovementQueue = {
  type: 'player';
  id: string;
  queue: CharacterMovementQueue;
};

type SetMobMovementQueue = {
  type: 'mob';
  id: string;
  queue: MobMovementQueue;
};
