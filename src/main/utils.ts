import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const readJson = async <T>(filePath: string): Promise<T> => {
  const data = await readFile(filePath, 'utf-8');
  return JSON.parse(data);
};

export const readLines = async (filePath: string): Promise<string[]> => {
  const data = await readFile(filePath, 'utf-8');
  return data.split(/\r?\n/).filter((line) => !!line.trim());
};

export const saveJson = async (
  filePath: string,
  json: unknown,
  { pretty = false }: { pretty?: boolean } = {},
) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  const data = pretty ? JSON.stringify(json, null, 2) : JSON.stringify(json);
  return await writeFile(filePath, data);
};

export const saveText = async (filePath: string, text: string) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  return await writeFile(filePath, text);
};

export const deleteFile = async (filePath: string) => {
  return await rm(filePath, { force: true });
};

export const backupFiles = async (
  baseDir: string,
  filePaths?: string[],
  backupDirPostfix = '_backup',
) => {
  const timePostfix = new Date()
    .toISOString()
    .replaceAll(/[-:]/g, '')
    .replace('T', '_')
    .slice(0, 15);

  const backupTargets = filePaths || [''];
  const backupDir = `${baseDir}${backupDirPostfix}_${timePostfix}`;

  await rm(backupDir, { recursive: true, force: true });
  await mkdir(backupDir, { recursive: true });
  return await batchPromiseAll(backupTargets, async (filePath) => {
    const abosoluteFilePath = path.resolve(baseDir, filePath);
    const newPath = path.resolve(backupDir, filePath);

    if (path.extname(filePath) === '') {
      return await cp(abosoluteFilePath, newPath, { recursive: true });
    }

    await mkdir(path.dirname(newPath), { recursive: true });
    try {
      await rename(abosoluteFilePath, newPath);
    } catch {
      // ignore file missing error.
    }
  });
};

export const batchPromiseAll = async <T, R>(
  values: T[],
  callback: (value: T) => Promise<R>,
  batchSize = 10,
): Promise<R[]> => {
  const results: R[] = [];

  for (let i = 0; i < values.length; i += batchSize) {
    const batch = values.slice(i, i + batchSize);
    const result = await Promise.all(batch.map(callback));
    results.push(...result);
  }

  return results;
};

export const toPosix = (filePath: string) =>
  filePath.split(path.sep).join(path.posix.sep);
