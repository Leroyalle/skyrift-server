import { ConnectPlayerPayload } from '../../types/connect-player-payload.type';

export class ConnectPlayerCommand {
  constructor(public readonly props: ConnectPlayerPayload) {}
}
