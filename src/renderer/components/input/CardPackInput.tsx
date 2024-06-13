import {
  Portal,
  Tag,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { IFuseOptions } from 'fuse.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { AssetCategory } from '../../../common/type';
import { ygoPacks, ygoPacksMap } from '../../data';
import { AssetImage } from '../common/AssetImage';
import { ComboboxInput } from './ComboboxInput';

const useStyles = makeStyles({
  inputIcon: {
    height: '20px',
  },
  inputIconContainer: {
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalS,
  },
  menuitem: {
    padding: tokens.spacingVerticalM,
    display: 'flex',
    alignItems: 'center',
    columnGap: tokens.spacingHorizontalM,
    minWidth: '250px',
  },
  menuItemText: {
    flex: '1',
  },
  menuitemThumbnail: {
    height: '32px',
  },
  menuItemIndex: {
    width: '40px',
    justifyItems: 'center',
  },
  menuItemRelease: {
    width: '60px',
    justifyItems: 'center',
    background: tokens.colorNeutralBackground2,
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

interface CardPackOption {
  id: number;
  name: string;
  index?: number;
  release?: number;
}

const releaseDateString = (release?: number) => {
  if (!release) return '';

  const date = new Date(release);
  const year = (date.getFullYear() - 2000).toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');

  return `${year}/${month}`;
};

const optionToString = (option?: CardPackOption) => option?.name ?? '';
const compareValues = (a?: CardPackOption, b?: CardPackOption) =>
  Boolean(a && b && a.id === b.id);
const fuseOptions: IFuseOptions<CardPackOption> = {
  keys: ['name', 'index'],
};

interface CardPackInputProps {
  value: number;
  label: string;
  required?: boolean;
  onChange: (value: number) => void;
  getThumbnailSrc?: (category: string, id: number) => string;
  getImageSrc?: (category: string, id: number) => string;
}

export const CardPackInput = ({
  value,
  label,
  required,
  onChange,
  getThumbnailSrc,
  getImageSrc,
}: CardPackInputProps) => {
  const classes = useStyles();

  const highlightImageRef = useRef<HTMLImageElement>(null);
  const [highlightedId, setHighlightedId] = useState<number>();
  const [highlightedPosition, setHighlightedPosition] = useState<{
    x: number;
    y: number;
  }>();

  const handleHighlightChange = useCallback(
    (change?: { value: CardPackOption; node: HTMLDivElement }) => {
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
    ({ id }: CardPackOption) => onChange(id),
    [onChange],
  );

  const inputValue = useMemo<CardPackOption>(() => {
    const pack = ygoPacksMap.get(value);

    return {
      id: value,
      name: pack?.name ?? '',
      index: pack?.index,
      release: pack?.release,
    };
  }, [value]);

  return (
    <>
      <ComboboxInput
        label={label}
        required={required}
        value={inputValue}
        options={ygoPacks}
        fuseOptions={fuseOptions}
        onChange={handleChange}
        onChangeHighlight={handleHighlightChange}
        valueToString={optionToString}
        compareValues={compareValues}
        icon={
          <div className={classes.inputIconContainer}>
            <Tag className={classes.menuItemIndex} size="extra-small">
              {inputValue.index}
            </Tag>
            <AssetImage
              thumbnail
              className={classes.inputIcon}
              category={AssetCategory.CARD_PACK}
              item={value}
              getSrc={getThumbnailSrc}
            />
          </div>
        }
      >
        {({ value }) => (
          <div className={classes.menuitem}>
            <Tag className={classes.menuItemIndex} size="small">
              {value.index}
            </Tag>
            <Text className={classes.menuItemText}>{value.name}</Text>
            <Tag className={classes.menuItemRelease} size="small">
              {releaseDateString(value.release)}
            </Tag>
            <AssetImage
              thumbnail
              className={classes.menuitemThumbnail}
              category={AssetCategory.CARD_PACK}
              item={value.id}
              getSrc={getThumbnailSrc}
            />
          </div>
        )}
      </ComboboxInput>
      {highlightedId !== undefined && (
        <Portal mountNode={{ className: classes.menuitemPortal }}>
          <AssetImage
            ref={highlightImageRef}
            className={classes.menuitemImage}
            category={AssetCategory.CARD_PACK}
            item={highlightedId}
            getSrc={getImageSrc}
          />
        </Portal>
      )}
    </>
  );
};