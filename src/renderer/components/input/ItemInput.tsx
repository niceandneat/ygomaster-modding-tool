import {
  Field,
  Input,
  Portal,
  Text,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { IFuseOptions } from 'fuse.js';
import { useCallback, useMemo, useRef, useState } from 'react';

import { Item, ItemCategory } from '../../../common/type';
import { ygoItems, ygoItemsMap } from '../../data';
import { handleNumberInput } from '../../utils/handleNumberInput';
import { AssetImage } from '../common/AssetImage';
import { ComboboxInput } from './ComboboxInput';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalM,
  },
  categoryInput: {
    width: '160px',
  },
  idInput: {
    width: '240px',
  },
  countsInput: {
    width: '100px',
  },
  menuitem: {
    ...shorthands.padding(tokens.spacingVerticalM),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: tokens.spacingHorizontalM,
  },
  menuitemThumbnail: {
    height: '32px',
  },
  menuitemPortal: {
    zIndex: 2000000,
  },
  menuitemImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    maxWidth: '240px',
  },
});

interface CategoryOption<T extends ItemCategory> {
  category: T;
  name: string;
}

interface IdOption {
  id: string;
  name: string;
}

interface ItemInputProps<T extends ItemCategory> {
  value: Item<T>;
  categories?: T[];
  onChange: (item: Item<T>) => void;
  getThumbnailSrc?: (category: string, id: string) => string;
  getImageSrc?: (category: string, id: string) => string;
}

const defaultCategories: ItemCategory[] = Object.values(ItemCategory).filter(
  (value): value is ItemCategory => !Number.isNaN(Number(value)),
);
const categoryNameMap = Object.fromEntries(
  Object.entries(ItemCategory).map(([name, category]) => [category, name]),
) as Record<ItemCategory, string>;
const categoryDefaultIdMap = {
  ...Object.fromEntries(
    [...ygoItems.entries()].map(([category, [{ id }]]) => [category, id]),
  ),
  [ItemCategory.CARD]: '4007', // Blue-Eyes White Dragon
} as Record<ItemCategory, string>;

const categoryOptionToString = (option?: CategoryOption<ItemCategory>) =>
  option?.name ?? '';
const categoryCompareValues = (
  a?: CategoryOption<ItemCategory>,
  b?: CategoryOption<ItemCategory>,
) => Boolean(a && b && a.category === b.category);
const categoryFuseOptions: IFuseOptions<CategoryOption<ItemCategory>> = {
  keys: ['name'],
};

const idOptionToString = (option?: IdOption) => option?.name ?? '';
const idCompareValues = (a?: IdOption, b?: IdOption) =>
  Boolean(a && b && a.id === b.id);
const idFuseOptions: IFuseOptions<IdOption> = {
  keys: ['name'],
};

export const ItemInput = <T extends ItemCategory>({
  value,
  categories = defaultCategories as T[],
  onChange,
  getThumbnailSrc,
  getImageSrc,
}: ItemInputProps<T>) => {
  const classes = useStyles();

  const [highlightedId, setHighlightedId] = useState<string>();
  const [highlightedPosition, setHighlightedPosition] = useState<{
    x: number;
    y: number;
  }>();

  const valueRef = useRef<Item<T>>(value);
  valueRef.current = value;

  const handleCategoryOptionChange = useCallback(
    ({ category }: CategoryOption<T>) => {
      if (valueRef.current.category === category) return;
      onChange({
        ...valueRef.current,
        category,
        id: categoryDefaultIdMap[category],
      });
    },
    [onChange],
  );

  const handleIdOptionChange = useCallback(
    ({ id }: IdOption) => {
      if (valueRef.current.id === id) return;
      onChange({ ...valueRef.current, id });
    },
    [onChange],
  );

  const handleCountsChange = useMemo(
    () =>
      handleNumberInput((counts: number) =>
        onChange({ ...valueRef.current, counts }),
      ),
    [onChange],
  );

  const handleHighlightChange = useCallback(
    (change?: { value: IdOption; node: HTMLDivElement }) => {
      if (!change) {
        setHighlightedId(undefined);
        setHighlightedPosition(undefined);
        return;
      }

      const { x, y } = change.node.getBoundingClientRect();

      setHighlightedId(change.value.id);
      setHighlightedPosition({ x, y });
    },
    [],
  );

  const categoryValue = useMemo<CategoryOption<T>>(
    () => ({
      category: value.category,
      name: categoryNameMap[value.category],
    }),
    [value.category],
  );

  const categoryOptions = useMemo<CategoryOption<T>[]>(
    () =>
      Object.entries(ItemCategory)
        .map(([name, category]) => ({ category, name }))
        .filter((option): option is CategoryOption<T> =>
          categories.includes(option.category as T),
        ),
    [categories],
  );

  const idValue = useMemo<IdOption>(
    () => ({
      id: value.id,
      name: ygoItemsMap.get(value.category)?.get(value.id)?.name ?? '',
    }),
    [value.category, value.id],
  );

  const idOptions = useMemo<IdOption[]>(
    () => ygoItems.get(value.category) ?? [],
    [value.category],
  );

  const shouldShowImage = useMemo(
    () =>
      ![
        ItemCategory.NONE,
        ItemCategory.PROFILE_TAG,
        ItemCategory.STRUCTURE,
        ItemCategory.CARD,
      ].includes(categoryValue.category),
    [categoryValue.category],
  );

  return (
    <div className={classes.container}>
      <div className={classes.categoryInput}>
        <ComboboxInput
          label="category"
          value={categoryValue}
          options={categoryOptions}
          fuseOptions={categoryFuseOptions}
          onChange={handleCategoryOptionChange}
          valueToString={categoryOptionToString}
          compareValues={categoryCompareValues}
        >
          {({ value }) => <div className={classes.menuitem}>{value.name}</div>}
        </ComboboxInput>
      </div>
      <div className={classes.idInput}>
        <ComboboxInput
          label="id"
          value={idValue}
          options={idOptions}
          fuseOptions={idFuseOptions}
          onChange={handleIdOptionChange}
          onChangeHighlight={
            shouldShowImage ? handleHighlightChange : undefined
          }
          valueToString={idOptionToString}
          compareValues={idCompareValues}
        >
          {({ value }) => (
            <div className={classes.menuitem}>
              <Text>{value.name}</Text>
              {shouldShowImage && (
                <AssetImage
                  thumbnail
                  className={classes.menuitemThumbnail}
                  category={categoryValue.category}
                  item={value.id}
                  getSrc={getThumbnailSrc}
                />
              )}
            </div>
          )}
        </ComboboxInput>
        {highlightedId && (
          <Portal mountNode={{ className: classes.menuitemPortal }}>
            <AssetImage
              className={classes.menuitemImage}
              style={{
                transform:
                  highlightedPosition &&
                  `translate(calc(${highlightedPosition.x - 12}px - 100%), ${highlightedPosition.y}px)`,
              }}
              category={categoryValue.category}
              item={highlightedId}
              getSrc={getImageSrc}
            />
          </Portal>
        )}
      </div>
      <Field label="counts">
        <Input
          className={classes.countsInput}
          type="number"
          value={value.counts.toString()}
          onChange={handleCountsChange}
        />
      </Field>
    </div>
  );
};
