import { assertNotNull } from 'src/realtime/shared/lib/guards/assert-not-null.lib';

export function assertHasInventory<
  T extends { equipmentId: string | null | undefined; bagId: string | null | undefined },
>(props: T): asserts props is T & { equipmentId: string; bagId: string } {
  assertNotNull(props.equipmentId, 'Player equipmentId is null');
  assertNotNull(props.bagId, 'Player bagId is null');
}
