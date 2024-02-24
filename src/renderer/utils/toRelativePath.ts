export const toRelativePath = (absolutePath: string, basePath: string) => {
  return absolutePath.replace(basePath, '').replace(/^[/\\]/, '');
};
