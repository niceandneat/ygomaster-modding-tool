export const toAbsolutePath = (relativePath: string, basePath: string) => {
  const isWindows = !basePath.startsWith('/');
  const seperator = isWindows ? '\\' : '/';
  const posixRelativePath = isWindows
    ? relativePath.replaceAll('/', '\\')
    : relativePath;

  return `${basePath}${seperator}${posixRelativePath.replace(/^\//, '')}`;
};
