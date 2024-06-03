export const toAbsolutePath = (relativePath: string, basePath: string) => {
  const isWindows = !basePath.startsWith('/');
  const separator = isWindows ? '\\' : '/';
  const posixRelativePath = isWindows
    ? relativePath.replaceAll('/', '\\')
    : relativePath;

  return `${basePath}${separator}${posixRelativePath.replace(/^\//, '')}`;
};
