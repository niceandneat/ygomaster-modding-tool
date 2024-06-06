import { Image, ImageProps } from '@fluentui/react-components';
import { ReactEventHandler, forwardRef } from 'react';

import { ItemCategory } from '../../../common/type';

type GetSrc = (category: string, item: string) => string;

const getThumbnailSrc: GetSrc = (category, item) =>
  `static://item-thumbnails/${category}/${item}.webp`;
const getImageSrc: GetSrc = (category, item) =>
  `static://item-images/${category}/${item}.webp`;

// Show empty image for missing assets
const handleImageError: ReactEventHandler<HTMLImageElement> = (e) => {
  e.currentTarget.src =
    'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
};

const getValidItemInfo = (
  category: ItemCategory,
  item: string,
): { category: ItemCategory; item: string } => {
  if (category === ItemCategory.CARD) {
    return { category: ItemCategory.PROTECTOR, item: '1070001' };
  }

  if (category === ItemCategory.STRUCTURE) {
    return { category: ItemCategory.DECK_CASE, item: '1080001' };
  }

  return { category, item };
};

interface AssetImageProps extends ImageProps {
  category: ItemCategory;
  item: string;
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
