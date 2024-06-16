import { Image, ImageProps } from '@fluentui/react-components';
import { ReactEventHandler, forwardRef } from 'react';

import { AssetCategory } from '../../../common/type';
import { getImageSrc, getThumbnailSrc } from '../../utils/getSrc';

// Show empty image for missing assets
const handleImageError: ReactEventHandler<HTMLImageElement> = (e) => {
  e.currentTarget.src =
    'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
};

interface AssetImageProps extends ImageProps {
  category: AssetCategory;
  item: number;
  thumbnail?: boolean;
}

export const AssetImage = forwardRef<HTMLImageElement, AssetImageProps>(
  ({ category, item, thumbnail, ...props }, ref) => {
    const getSrc = thumbnail ? getThumbnailSrc : getImageSrc;

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
