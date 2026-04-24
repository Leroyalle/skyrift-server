import type { MessageTextVo } from '../vo/message-text.vo';

export type MessageType = 'location' | 'world' | 'direct';

export interface IMessage {
  senderId: string;
  senderName: string;
  message: MessageTextVo;
  ts: number;
  type: MessageType;
}

export interface MessageSnapshot {
  senderId: string;
  senderName: string;
  message: string;
  ts: number;
  type: MessageType;
}
