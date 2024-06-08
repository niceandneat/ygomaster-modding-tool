import { Field, Input, makeStyles, tokens } from '@fluentui/react-components';
import { IFuseOptions } from 'fuse.js';
import { useCallback, useMemo, useRef } from 'react';

import { Item, ItemCategory, itemCategories } from '../../../common/type';
import { ygoItems } from '../../data';
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

interface CategoryOption<T extends ItemCategory> {
  category: T;
  name: string;
}

interface ItemInputProps<T extends ItemCategory> {
  value: Item<T>;
  categories?: T[];
  onChange: (item: Item<T>) => void;
  getThumbnailSrc?: (category: string, id: number) => string;
  getImageSrc?: (category: string, id: number) => string;
}

const defaultCategories = itemCategories.filter((c) => c !== ItemCategory.NONE);
const categoryDefaultIdMap = {
  ...Object.fromEntries(
    [...ygoItems.entries()].map(([category, [{ id }]]) => [category, id]),
  ),
  [ItemCategory.CARD]: 4007, // Blue-Eyes White Dragon
} as Record<ItemCategory, number>;

const categoryOptionToString = (option?: CategoryOption<ItemCategory>) =>
  option?.name ?? '';
const categoryCompareValues = (
  a?: CategoryOption<ItemCategory>,
  b?: CategoryOption<ItemCategory>,
) => Boolean(a && b && a.category === b.category);
const categoryFuseOptions: IFuseOptions<CategoryOption<ItemCategory>> = {
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

  const categoryValue = useMemo<CategoryOption<T>>(
    () => ({
      category: value.category,
      name: ItemCategory[value.category],
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
        <ItemIdInput
          label="id"
          category={value.category}
          value={value.id}
          onChange={handleIdChange}
          getImageSrc={getImageSrc}
          getThumbnailSrc={getThumbnailSrc}
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
};
