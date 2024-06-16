import { Portal, Text, makeStyles, tokens } from '@fluentui/react-components';
import { IFuseOptions } from 'fuse.js';
import { useCallback, useMemo } from 'react';

import { ItemCategory } from '../../../common/type';
import { dataStore } from '../../data';
import { useHighlightElement } from '../../hooks/useHighlightElement';
import { ItemImage } from '../common/ItemImage';
import { ComboboxInput } from './ComboboxInput';

const useStyles = makeStyles({
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

interface ItemIdOption {
  id: number;
  name: string;
}

const getValidIdForImage = (category: ItemCategory, id: number) =>
  id > 0 ? id : dataStore.getItems(category)?.at(0)?.id ?? 0;

const optionToString = (option?: ItemIdOption) => option?.name ?? '';
const compareValues = (a?: ItemIdOption, b?: ItemIdOption) =>
  Boolean(a && b && a.id === b.id);
const fuseOptions: IFuseOptions<ItemIdOption> = {
  keys: ['name'],
};

interface ItemIdInputProps<T extends ItemCategory> {
  category: T;
  value: number;
  label: string;
  required?: boolean;
  includeNone?: boolean;
  onChange: (value: number) => void;
}

export const ItemIdInput = <T extends ItemCategory>({
  category,
  value,
  label,
  required,
  includeNone,
  onChange,
}: ItemIdInputProps<T>) => {
  const classes = useStyles();
  const { highlightImageRef, highlightedId, handleHighlightChange } =
    useHighlightElement();

  const handleChange = useCallback(
    ({ id }: ItemIdOption) => onChange(id),
    [onChange],
  );

  const itemOptions = useMemo<ItemIdOption[]>(() => {
    const options = dataStore.getItems(category);

    if (includeNone) {
      return [{ id: 0, name: 'None' }, ...options];
    }

    return options;
  }, [category, includeNone]);

  const itemValue = useMemo<ItemIdOption>(
    () => ({
      id: value,
      name: value > 0 ? dataStore.getItem(category, value)?.name ?? '' : 'None',
    }),
    [category, value],
  );

  const shouldShowImage = useMemo(
    () =>
      ![
        ItemCategory.NONE,
        ItemCategory.PROFILE_TAG,
        ItemCategory.STRUCTURE,
        ItemCategory.CARD,
      ].includes(category),
    [category],
  );

  return (
    <>
      <ComboboxInput
        label={label}
        required={required}
        value={itemValue}
        options={itemOptions}
        fuseOptions={fuseOptions}
        onChange={handleChange}
        onChangeHighlight={shouldShowImage ? handleHighlightChange : undefined}
        valueToString={optionToString}
        compareValues={compareValues}
        icon={
          shouldShowImage && (
            <ItemImage
              thumbnail
              className={classes.inputIcon}
              category={category}
              item={getValidIdForImage(category, value)}
            />
          )
        }
      >
        {({ value }) => (
          <div className={classes.menuitem}>
            <Text>{value.name}</Text>
            {shouldShowImage && (
              <ItemImage
                thumbnail
                className={classes.menuitemThumbnail}
                category={category}
                item={getValidIdForImage(category, value.id)}
              />
            )}
          </div>
        )}
      </ComboboxInput>
      {highlightedId !== undefined && (
        <Portal mountNode={{ className: classes.menuitemPortal }}>
          <ItemImage
            ref={highlightImageRef}
            className={classes.menuitemImage}
            category={category}
            item={getValidIdForImage(category, highlightedId)}
          />
        </Portal>
      )}
    </>
  );
};
