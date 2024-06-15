export const toAbsolutePath = (relativePath: string, basePath: string) => {
  const isWindows = !basePath.startsWith('/');
  const separator = isWindows ? '\\' : '/';
  const osRelativePath = isWindows
    ? relativePath.replaceAll('/', '\\')
    : relativePath;

  return `${basePath}${separator}${osRelativePath.replace(/^\//, '')}`;
};
