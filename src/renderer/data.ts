import { ItemCategory } from '../common/type';
import cardPacksData from '../data/cardPacks.json';
import cardsData from '../data/cards.json';
import itemsData from '../data/items.json';

interface ItemData {
  id: number;
  name: string;
}

interface CardData {
  id: number;
  name: string;
}

interface PackData {
  id: number;
  name: string;
  index: number;
  release: number;
}

interface DataStoreOption {
  language: string;
}

class DataStore {
  private itemMapByCategory!: Map<ItemCategory, Map<number, ItemData>>;
  private itemsByCategory!: Map<ItemCategory, ItemData[]>;
  private cardMap!: Map<number, CardData>;
  private cards!: CardData[];
  private packMap!: Map<number, PackData>;
  private packs!: PackData[];

  constructor(option?: Partial<DataStoreOption>) {
    this.setItemData();
    this.setOption(option);
  }

  setOption(inputOption?: Partial<DataStoreOption>) {
    const option = this.applyDefault(inputOption, { language: 'English' });

    this.setCardData(option);
    this.setPackData(option);
  }

  getItem(category: ItemCategory, id: number): ItemData | undefined {
    if (category === ItemCategory.CARD) return this.getCard(id);
    return this.itemMapByCategory.get(category)?.get(id);
  }

  getItems(category: ItemCategory): ItemData[] {
    if (category === ItemCategory.CARD) return this.getCards();
    return this.itemsByCategory.get(category) ?? [];
  }

  getCard(id: number): CardData | undefined {
    return this.cardMap.get(id);
  }

  getCards(): CardData[] {
    return this.cards;
  }

  getPack(id: number): PackData | undefined {
    return this.packMap.get(id);
  }

  getPacks(): PackData[] {
    return this.packs;
  }

  private setItemData() {
    this.itemMapByCategory = new Map<ItemCategory, Map<number, ItemData>>([
      ...Object.entries(itemsData).map(
        ([category, items]) =>
          [
            ItemCategory[category as keyof typeof itemsData],
            new Map(
              items.map((item) => {
                const id = Number(item.id);
                return [id, { id, name: item.name }];
              }),
            ),
          ] as const,
      ),
    ]);

    this.itemsByCategory = new Map<ItemCategory, ItemData[]>(
      [...this.itemMapByCategory.entries()].map(([category, itemsMap]) => [
        category,
        [...itemsMap.values()],
      ]),
    );
  }

  private setCardData(option: DataStoreOption) {
    this.cardMap = new Map<number, CardData>(
      cardsData.map((card) => {
        const id = Number(card.id);
        return [id, { id, name: card.name }];
      }),
    );

    this.cards = [...this.cardMap.values()];
  }

  private setPackData(option: DataStoreOption) {
    this.packMap = new Map<number, PackData>(
      cardPacksData.map((card) => {
        const id = Number(card.id);
        return [id, { ...card, id }];
      }),
    );

    this.packs = [...this.packMap.values()];
  }

  private applyDefault(
    inputOption: Partial<DataStoreOption> | undefined,
    defaultOption: DataStoreOption,
  ) {
    const option = { ...defaultOption };

    if (!inputOption) return option;

    Object.keys(defaultOption).forEach((key) => {
      const value = inputOption[key as keyof DataStoreOption];
      if (value) {
        option[key as keyof DataStoreOption] = value;
      }
    });

    return option;
  }
}

export const dataStore = new DataStore();
