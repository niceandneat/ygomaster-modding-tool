import { Image, ImageProps } from '@fluentui/react-components';
import { ReactEventHandler, forwardRef } from 'react';

import { ItemCategory } from '../../../common/type';

type GetSrc = (category: string, item: number) => string;

const getThumbnailSrc: GetSrc = (category, item) =>
  `static://thumbnails/${category}/${item}.webp`;
const getImageSrc: GetSrc = (category, item) =>
  `static://images/${category}/${item}.webp`;

// Show empty image for missing assets
const handleImageError: ReactEventHandler<HTMLImageElement> = (e) => {
  e.currentTarget.src =
    'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
};

const getValidItemInfo = (
  category: ItemCategory,
  item: number,
): { category: ItemCategory; item: number } => {
  if (category === ItemCategory.CARD) {
    return { category: ItemCategory.PROTECTOR, item: 1070001 };
  }

  if (category === ItemCategory.STRUCTURE) {
    return { category: ItemCategory.DECK_CASE, item: 1080001 };
  }

  return { category, item };
};

interface AssetImageProps extends ImageProps {
  category: ItemCategory;
  item: number;
  getSrc?: GetSrc;
  thumbnail?: boolean;
}

export const AssetImage = forwardRef<HTMLImageElement, AssetImageProps>(
  (
    {
      category: categoryProps,
      item: itemProps,
      getSrc: getSrcProps,
      thumbnail,
      ...props
    },
    ref,
  ) => {
    const getSrc = getSrcProps || (thumbnail ? getThumbnailSrc : getImageSrc);
    const { category, item } = getValidItemInfo(categoryProps, itemProps);

    return (
      <Image
        ref={ref}
        src={getSrc(ItemCategory[category], item)}
        onError={handleImageError}
        {...props}
      />
    );
  },
);

AssetImage.displayName = 'AssetImage';
