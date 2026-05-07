import { assertNotNull } from 'src/realtime/shared/lib/guards/assert-not-null.lib';

export function assertCreatureHasInventory<T extends { equipmentId: string | null | undefined }>(
  props: T,
): asserts props is T & { equipmentId: string } {
  assertNotNull(props.equipmentId, 'Player equipmentId is null');
}
