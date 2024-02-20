export const toAbsolutePath = (relativePath: string, basePath: string) => {
  return `${basePath}/${relativePath.replace(/^\//, '')}`;
};
