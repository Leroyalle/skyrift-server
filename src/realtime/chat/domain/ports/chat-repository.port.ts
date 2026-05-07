import type { Message } from '../entities/message.entity';

export interface ChatRepositoryPort {
  add(message: Message, recipientId?: string): Promise<void>;
}
