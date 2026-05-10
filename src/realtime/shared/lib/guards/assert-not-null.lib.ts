export function assertNotNull<T>(value: T, message: string): asserts value is NonNullable<T> {
  if (value == null) {
    throw new Error(message);
  }
}
