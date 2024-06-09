import { Portal, Text, makeStyles, tokens } from '@fluentui/react-components';
import { IFuseOptions } from 'fuse.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

const getValidIdForImage = (category: ItemCategory, id: number) =>
  id > 0 ? id : ygoItems.get(category)?.at(0)?.id ?? 0;

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
  getThumbnailSrc?: (category: string, id: number) => string;
  getImageSrc?: (category: string, id: number) => string;
}

export const ItemIdInput = <T extends ItemCategory>({
  category,
  value,
  label,
  required,
  includeNone,
  onChange,
  getThumbnailSrc,
  getImageSrc,
}: ItemIdInputProps<T>) => {
  const classes = useStyles();

  const highlightImageRef = useRef<HTMLImageElement>(null);
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

  // TODO Fix delay of getting size when highlightedId changes too fast
  useEffect(() => {
    if (!highlightImageRef.current || !highlightedPosition) return;

    const rect = highlightImageRef.current.getBoundingClientRect();

    const xOffset = highlightedPosition.x - 12;
    // Prevent images from being cropped when the option position is too low
    const yOffset =
      highlightedPosition.y + rect.height > window.innerHeight - 12
        ? window.innerHeight - rect.height - 12
        : highlightedPosition.y;

    highlightImageRef.current.style.transform = `translate(calc(${xOffset}px - 100%), ${yOffset}px)`;
  }, [highlightedPosition]);

  const handleChange = useCallback(
    ({ id }: ItemIdOption) => onChange(id),
    [onChange],
  );

  const itemOptions = useMemo<ItemIdOption[]>(() => {
    const options = ygoItems.get(category) ?? [];

    if (includeNone) {
      return [{ id: 0, name: 'None' }, ...options];
    }

    return options;
  }, [category, includeNone]);

  const itemValue = useMemo<ItemIdOption>(
    () => ({
      id: value,
      name:
        value > 0 ? ygoItemsMap.get(category)?.get(value)?.name ?? '' : 'None',
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
            <AssetImage
              thumbnail
              className={classes.inputIcon}
              category={category}
              item={getValidIdForImage(category, value)}
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
                item={getValidIdForImage(category, value.id)}
                getSrc={getThumbnailSrc}
              />
            )}
          </div>
        )}
      </ComboboxInput>
      {highlightedId !== undefined && (
        <Portal mountNode={{ className: classes.menuitemPortal }}>
          <AssetImage
            ref={highlightImageRef}
            className={classes.menuitemImage}
            category={category}
            item={getValidIdForImage(category, highlightedId)}
            getSrc={getImageSrc}
          />
        </Portal>
      )}
    </>
  );
};
