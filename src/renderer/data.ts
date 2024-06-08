import { ItemCategory } from '../common/type';
import cardsData from '../data/cards.json';
import itemsData from '../data/items.json';

export interface YgoItemData {
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
