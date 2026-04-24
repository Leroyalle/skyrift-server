export class MessageTextVo {
  constructor(public readonly value: string) {}

  public static create(text: string) {
    if (text.length === 0) throw new Error('Message text is empty');
    if (text.length > 200) throw new Error('Message text is too long');

    return new MessageTextVo(text);
  }
}
