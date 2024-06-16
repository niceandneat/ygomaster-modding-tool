type GetSrc = (category: string, item: number) => string;

const protocol = import.meta.env.STORYBOOK ? '/' : 'static://';

export const getThumbnailSrc: GetSrc = (category, item) =>
  `${protocol}thumbnails/${category}/${item}.webp`;
export const getImageSrc: GetSrc = (category, item) =>
  `${protocol}images/${category}/${item}.webp`;
