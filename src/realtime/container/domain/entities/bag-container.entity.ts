export type RuntimeContainerType = 'player-bag' | 'player-equipment' | 'chest' | 'ground';

export type RuntimeItem = {
  id: string;
  name: string;
  itemType: 'weapon' | 'armor' | 'resource' | 'consumable';
};

type Props = {
  id: string;
  type: RuntimeContainerType;
  ownerId: string;
  items: RuntimeItem[];
  capacity: number | null;
};

export class BagContainer {
  private constructor(private readonly props: Props) {}

  public static create(props: Props) {
    return new BagContainer(props);
  }

  public get id(): string {
    return this.props.id;
  }

  public addItem(item: RuntimeItem): void {
    if (this.props.capacity !== null && this.props.items.length >= this.props.capacity) {
      throw new Error('Container is full');
    }

    this.props.items.push(item);
  }

  public removeItem(itemId: string): RuntimeItem {
    const item = this.props.items.find(i => i.id === itemId);

    if (!item) {
      throw new Error('Item not found');
    }

    this.props.items = this.props.items.filter(i => i.id !== itemId);
    return item;
  }

  public findItem(itemId: string): RuntimeItem | null {
    return this.props.items.find(i => i.id === itemId) ?? null;
  }

  public hasItem(itemId: string): boolean {
    return this.findItem(itemId) !== null;
  }

  public snapshot(): Readonly<Props> {
    return this.props;
  }
}
