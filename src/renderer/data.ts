import { ItemCategory } from '../common/type';
import cardsData from '../data/cards.json';
import itemsData from '../data/items.json';

export interface YgoItemData {
  id: string;
  name: string;
}

export const ygoItemsMap = new Map<ItemCategory, Map<string, YgoItemData>>([
  ...Object.entries(itemsData).map(
    ([category, items]) =>
      [
        ItemCategory[category as keyof typeof itemsData],
        new Map(items.map((item) => [item.id, item])),
      ] as const,
  ),
  [ItemCategory.CARD, new Map(cardsData.map((card) => [card.id, card]))],
]);

export const ygoItems = new Map<ItemCategory, YgoItemData[]>(
  [...ygoItemsMap.entries()].map(([category, itemsMap]) => [
    category,
    [...itemsMap.values()],
  ]),
);
