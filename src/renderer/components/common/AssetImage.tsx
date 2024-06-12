import { Image, ImageProps } from '@fluentui/react-components';
import { ReactEventHandler, forwardRef } from 'react';

import { AssetCategory } from '../../../common/type';

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

interface AssetImageProps extends ImageProps {
  category: AssetCategory;
  item: number;
  getSrc?: GetSrc;
  thumbnail?: boolean;
}

export const AssetImage = forwardRef<HTMLImageElement, AssetImageProps>(
  ({ category, item, thumbnail, getSrc: getSrcProps, ...props }, ref) => {
    const getSrc = getSrcProps || (thumbnail ? getThumbnailSrc : getImageSrc);

    return (
      <Image
        ref={ref}
        src={getSrc(AssetCategory[category], item)}
        onError={handleImageError}
        {...props}
      />
    );
  },
);

AssetImage.displayName = 'AssetImage';
