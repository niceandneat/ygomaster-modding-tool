import { Portal, Text, makeStyles, tokens } from '@fluentui/react-components';
import { IFuseOptions } from 'fuse.js';
import { useCallback, useMemo, useState } from 'react';

import { ItemCategory } from '../../../common/type';
import { ygoItems, ygoItemsMap } from '../../data';
import { AssetImage } from '../common/AssetImage';
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
  onChange: (value: number) => void;
  getThumbnailSrc?: (category: string, id: number) => string;
  getImageSrc?: (category: string, id: number) => string;
}

export const ItemIdInput = <T extends ItemCategory>({
  category,
  value,
  label,
  required,
  onChange,
  getThumbnailSrc,
  getImageSrc,
}: ItemIdInputProps<T>) => {
  const classes = useStyles();

  const [highlightedId, setHighlightedId] = useState<number>();
  const [highlightedPosition, setHighlightedPosition] = useState<{
    x: number;
    y: number;
  }>();

  const handleHighlightChange = useCallback(
    (change?: { value: ItemIdOption; node: HTMLDivElement }) => {
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

  const handleChange = useCallback(
    ({ id }: ItemIdOption) => onChange(id),
    [onChange],
  );

  const itemOptions = useMemo<ItemIdOption[]>(
    () => ygoItems.get(category) ?? [],
    [category],
  );

  const itemValue = useMemo<ItemIdOption>(
    () =>
      value > 0
        ? {
            id: value,
            name: ygoItemsMap.get(category)?.get(value)?.name ?? '',
          }
        : itemOptions[0],
    [category, itemOptions, value],
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
            <AssetImage
              thumbnail
              className={classes.inputIcon}
              category={category}
              item={itemValue.id}
              getSrc={getThumbnailSrc}
            />
          )
        }
      >
        {({ value }) => (
          <div className={classes.menuitem}>
            <Text>{value.name}</Text>
            {shouldShowImage && (
              <AssetImage
                thumbnail
                className={classes.menuitemThumbnail}
                category={category}
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
            category={category}
            item={highlightedId}
            getSrc={getImageSrc}
          />
        </Portal>
      )}
    </>
  );
};
