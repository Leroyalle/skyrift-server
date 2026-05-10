export class ClassDescriptionVo {
  constructor(private readonly value: string) {}

  public getValue(): string {
    return this.value;
  }

  public static create(value: string) {
    if (value.length < 1) throw new Error('Class description is empty');
    if (value.length > 300) throw new Error('Class description is too long');
    return new ClassDescriptionVo(value);
  }
}
