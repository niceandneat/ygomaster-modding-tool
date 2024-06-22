import { Field, Input, makeStyles, tokens } from '@fluentui/react-components';
import { IFuseOptions } from 'fuse.js';
import { forwardRef, useCallback, useMemo, useRef } from 'react';

import { Item, ItemCategory, itemCategories } from '../../../common/type';
import { dataStore } from '../../data';
import { handleNumberInput } from '../../utils/handleNumberInput';
import { ComboboxInput } from './ComboboxInput';
import { ItemIdInput } from './ItemIdInput';

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
  inputIcon: {
    height: '20px',
  },
  menuitem: {
    padding: tokens.spacingVerticalM,
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

interface CategoryOption {
  category: ItemCategory;
  name: string;
}

interface ItemInputProps {
  value: Item<ItemCategory>;
  categories?: ItemCategory[];
  onChange: (item: Item<ItemCategory>) => void;
}

const defaultCategories = itemCategories.filter((c) => c !== ItemCategory.NONE);
const categoryDefaultIdMap = {
  ...Object.fromEntries(
    itemCategories.map((c) => [c, dataStore.getItems(c)[0]]),
  ),
  [ItemCategory.CARD]: 4007, // Blue-Eyes White Dragon
} as Record<ItemCategory, number>;
const getCategoryDefaultCounts = (category: ItemCategory) => {
  switch (category) {
    case ItemCategory.CONSUME:
      return 100;
    case ItemCategory.CARD:
      return 3;
    default:
      return 1;
  }
};

const categoryOptionToString = (option?: CategoryOption) => option?.name ?? '';
const categoryCompareValues = (a?: CategoryOption, b?: CategoryOption) =>
  Boolean(a && b && a.category === b.category);
const categoryFuseOptions: IFuseOptions<CategoryOption> = {
  keys: ['name'],
};

export const ItemInput = forwardRef<HTMLDivElement, ItemInputProps>(
  ({ value, categories = defaultCategories, onChange }, ref) => {
    const classes = useStyles();

    const valueRef = useRef<Item<ItemCategory>>(value);
    valueRef.current = value;

    const handleCategoryOptionChange = useCallback(
      ({ category }: CategoryOption) => {
        if (valueRef.current.category === category) return;
        onChange({
          ...valueRef.current,
          category,
          id: categoryDefaultIdMap[category],
          counts: getCategoryDefaultCounts(category),
        });
      },
      [onChange],
    );

    const handleIdChange = useCallback(
      (id: number) => {
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

    const categoryValue = useMemo<CategoryOption>(
      () => ({
        category: value.category,
        name: ItemCategory[value.category],
      }),
      [value.category],
    );

    const categoryOptions = useMemo<CategoryOption[]>(
      () =>
        Object.entries(ItemCategory)
          .map(([name, category]) => ({ category, name }))
          .filter((option): option is CategoryOption =>
            categories.includes(option.category as ItemCategory),
          ),
      [categories],
    );

    return (
      <div ref={ref} className={classes.container}>
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
            {({ value }) => (
              <div className={classes.menuitem}>{value.name}</div>
            )}
          </ComboboxInput>
        </div>
        <div className={classes.idInput}>
          <ItemIdInput
            label="id"
            category={value.category}
            value={value.id}
            onChange={handleIdChange}
          />
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
  },
);

ItemInput.displayName = 'ItemInput';
