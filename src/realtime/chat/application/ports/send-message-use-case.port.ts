import type { MessageType } from '../../domain/types/message.type';

export interface SendMessageUseCasePort {
  execute(payload: SendMessagePayload): Promise<void>;
}

export interface SendMessagePayload {
  senderId: string;
  receiverId?: string;
  message: string;
  type: MessageType;
}
