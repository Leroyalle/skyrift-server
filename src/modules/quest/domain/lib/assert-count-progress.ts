export function assertCountProgress(
  progress: unknown,
): asserts progress is { current: number; required: number } {
  if (
    typeof progress !== 'object' ||
    progress === null ||
    !('current' in progress) ||
    !('required' in progress)
  ) {
    throw new Error('Invalid count-based progress');
  }
}
