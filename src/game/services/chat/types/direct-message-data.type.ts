import { MessageData } from './message-data.type';

export type DirectMessageData = MessageData & { recipientId: string };
