import type { IMessage, MessageSnapshot } from '../types/message.type';

export class Message {
  private constructor(private readonly props: IMessage) {}

  public static create(props: IMessage) {
    return new Message(props);
  }

  public snapshot(): Readonly<MessageSnapshot> {
    return {
      ...this.props,
      message: this.props.message.value,
    };
  }

  public get senderId() {
    return this.props.senderId;
  }

  public get senderName() {
    return this.props.senderName;
  }

  public get message() {
    return this.props.message;
  }

  public get ts() {
    return this.props.ts;
  }

  public get type() {
    return this.props.type;
  }
}
