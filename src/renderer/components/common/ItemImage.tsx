import { Image, ImageProps } from '@fluentui/react-components';
import { ReactEventHandler, forwardRef } from 'react';

import { ItemCategory } from '../../../common/type';
import { getImageSrc, getThumbnailSrc } from '../../utils/getSrc';

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

interface ItemImageProps extends ImageProps {
  category: ItemCategory;
  item: number;
  thumbnail?: boolean;
}

export const ItemImage = forwardRef<HTMLImageElement, ItemImageProps>(
  ({ category: categoryProps, item: itemProps, thumbnail, ...props }, ref) => {
    const getSrc = thumbnail ? getThumbnailSrc : getImageSrc;
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

ItemImage.displayName = 'ItemImage';
