import {
  Field,
  Input,
  makeStyles,
  shorthands,
  tokens,
} from '@fluentui/react-components';
import { IFuseOptions } from 'fuse.js';
import { useCallback, useMemo, useRef } from 'react';

import { Item, ItemCategory } from '../../../common/type';
import { ygoItems, ygoItemsMap } from '../../data';
import { handleNumberInput } from '../../utils/handleNumberInput';
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
}

const defaultCategories: ItemCategory[] = Object.values(ItemCategory);
const categoryNameMap = Object.fromEntries(
  Object.entries(ItemCategory).map(([name, category]) => [category, name]),
) as Record<ItemCategory, string>;
const categoryDefaultIdMap = {
  ...Object.fromEntries(
    [...ygoItems.entries()].map(([category, [{ id }]]) => [category, id]),
  ),
  [ItemCategory.CARD]: '4007', // Blue-Eyes White Dragon
} as Record<ItemCategory, string>;

const categoryOptionToString = ({ name }: CategoryOption<ItemCategory>) => name;
const categoryFuseOptions: IFuseOptions<CategoryOption<ItemCategory>> = {
  keys: ['name'],
};

const idOptionToString = ({ name }: IdOption) => name;
const idFuseOptions: IFuseOptions<IdOption> = {
  keys: ['name'],
};

export const ItemInput = <T extends ItemCategory>({
  value,
  categories = defaultCategories as T[],
  onChange,
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
          valueToString={idOptionToString}
        >
          {({ value }) => <div className={classes.menuitem}>{value.name}</div>}
        </ComboboxInput>
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
