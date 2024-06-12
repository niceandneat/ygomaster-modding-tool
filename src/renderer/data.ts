import { ItemCategory } from '../common/type';
import cardPacksData from '../data/cardPacks.json';
import cardsData from '../data/cards.json';
import itemsData from '../data/items.json';

interface YgoItemData {
  id: number;
  name: string;
}

export const ygoItemsMap = new Map<ItemCategory, Map<number, YgoItemData>>([
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
  [
    ItemCategory.CARD,
    new Map(
      cardsData.map((card) => {
        const id = Number(card.id);
        return [id, { id, name: card.name }];
      }),
    ),
  ],
]);

export const ygoItems = new Map<ItemCategory, YgoItemData[]>(
  [...ygoItemsMap.entries()].map(([category, itemsMap]) => [
    category,
    [...itemsMap.values()],
  ]),
);

interface YgoPackData {
  id: number;
  name: string;
  index: number;
  release: number;
}

export const ygoPacksMap = new Map<number, YgoPackData>(
  cardPacksData.map((card) => {
    const id = Number(card.id);
    return [id, { ...card, id }];
  }),
);

export const ygoPacks: YgoPackData[] = [...ygoPacksMap.values()];
