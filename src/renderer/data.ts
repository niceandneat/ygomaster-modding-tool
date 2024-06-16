import { ItemCategory, StructureDeck } from '../common/type';
import cardPacksData from '../data/card-packs.json';
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
  structureDecks: StructureDeck[];
}

class DataStore {
  private itemMapByCategory!: Map<ItemCategory, Map<number, ItemData>>;
  private itemsByCategory!: Map<ItemCategory, ItemData[]>;
  private cardMap!: Map<number, CardData>;
  private cards!: CardData[];
  private packMap!: Map<number, PackData>;
  private packs!: PackData[];

  private option: DataStoreOption = {
    language: 'English',
    structureDecks: [],
  };

  constructor(option?: Partial<DataStoreOption>) {
    this.setOption(option);
  }

  setOption(inputOption?: Partial<DataStoreOption>) {
    const newOption = this.applyDefault(inputOption, this.option);

    this.option = newOption;
    this.setItemData(newOption);
    this.setCardData(newOption);
    this.setPackData(newOption);
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

  private setItemData(option: DataStoreOption) {
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

    // Add custom structure decks
    const structureDeckMap = this.itemMapByCategory.get(ItemCategory.STRUCTURE);
    if (structureDeckMap) {
      option.structureDecks.forEach(({ id, name }) => {
        structureDeckMap.set(id, { id, name });
      });
    }

    this.itemsByCategory = new Map<ItemCategory, ItemData[]>(
      [...this.itemMapByCategory.entries()].map(([category, itemsMap]) => [
        category,
        [...itemsMap.values()],
      ]),
    );
  }

  private setCardData(option: DataStoreOption) {
    const getName = (card: (typeof cardsData)[number]) => {
      if (option.language === 'Korean') {
        return card.korean.name || card.english.name;
      }
      return card.english.name;
    };

    this.cardMap = new Map<number, CardData>(
      cardsData.map((card) => {
        const id = Number(card.id);
        return [id, { id, name: getName(card) }];
      }),
    );

    this.cards = [...this.cardMap.values()];
  }

  private setPackData(option: DataStoreOption) {
    const getName = (card: (typeof cardPacksData)[number]) => {
      if (option.language === 'Korean') {
        return card.korean.name || card.english.name;
      }
      return card.english.name;
    };

    this.packMap = new Map<number, PackData>(
      cardPacksData.map((pack) => {
        const id = Number(pack.id);
        return [
          id,
          { id, index: pack.index, release: pack.release, name: getName(pack) },
        ];
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

    Object.keys(defaultOption).forEach((field) => {
      const key = field as keyof DataStoreOption;
      const value = inputOption[key];

      if (value) {
        option[key] = value as never;
      }
    });

    return option;
  }
}

export const dataStore = new DataStore();
