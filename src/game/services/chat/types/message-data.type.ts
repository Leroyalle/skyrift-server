export type MessageData = {
  senderId: string;
  senderName: string;
  message: string;
  ts: number;
  type: 'world' | 'location' | 'direct';
};
