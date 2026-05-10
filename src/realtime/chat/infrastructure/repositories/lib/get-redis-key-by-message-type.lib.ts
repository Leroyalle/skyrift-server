import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import type { MessageType } from 'src/realtime/chat/domain/types/message.type';

function requireTargetId(targetId: string | undefined, message: string): string {
  if (!targetId) throw new Error(message);
  return targetId;
}

export function getRedisKeyByMessageType(
  message: { senderId: string; type: MessageType },
  targetId?: string,
): string {
  switch (message.type) {
    case 'world':
      return RedisKeysFactory.chatWorld();

    case 'location':
      return RedisKeysFactory.chatLocation(
        requireTargetId(targetId, 'Location id is required for location message'),
      );

    case 'direct':
      return RedisKeysFactory.chatDirect(
        message.senderId,
        requireTargetId(targetId, 'Recipient id is required for direct message'),
      );
  }
}
