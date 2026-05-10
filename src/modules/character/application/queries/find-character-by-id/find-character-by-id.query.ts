export class FindCharacterByIdQuery {
  constructor(public readonly props: { userId: string; characterId: string }) {}
}
