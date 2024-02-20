export const toRelativePath = (absolutePath: string, basePath: string) => {
  return absolutePath.replace(new RegExp(`^${basePath}/?`), '');
};
