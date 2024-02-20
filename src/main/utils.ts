import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';

export const readJson = async <T>(path: string): Promise<T> => {
  const data = await readFile(path, 'utf-8');
  return JSON.parse(data);
};

export const readLines = async (path: string): Promise<string[]> => {
  const data = await readFile(path, 'utf-8');
  return data.split(/\r?\n/).filter((line) => !!line.trim());
};

export const saveJson = async (path: string, json: unknown) => {
  await mkdir(dirname(path), { recursive: true });
  return await writeFile(path, JSON.stringify(json));
};

export const saveText = async (path: string, text: string) => {
  await mkdir(dirname(path), { recursive: true });
  return await writeFile(path, text);
};

export const deleteFile = async (path: string) => {
  return await rm(path, { force: true });
};

export const backupFiles = async (
  paths: string[],
  baseDir: string,
  backupDirPostfix = '_backup',
) => {
  const backupDir = `${baseDir}${backupDirPostfix}`;

  await rm(backupDir, { recursive: true, force: true });
  await mkdir(backupDir, { recursive: true });
  return await batchPromiseAll(
    paths.map(async (path) => {
      const newPath = resolve(backupDir, relative(baseDir, path));

      await mkdir(dirname(newPath), { recursive: true });
      try {
        await rename(path, newPath);
      } catch {
        // ignore file missing error.
      }
    }),
  );
};

export const batchPromiseAll = async <T>(
  values: T[],
  batchSize = 10,
): Promise<Awaited<T>[]> => {
  const results: Awaited<T>[] = [];

  for (let i = 0; i < values.length; i += batchSize) {
    const batch = values.slice(i, i + batchSize);
    const result = await Promise.all(batch);
    results.push(...result);
  }

  return results;
};
