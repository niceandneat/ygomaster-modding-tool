import * as fs from 'node:fs/promises';
import path from 'node:path';

export const readLines = async (filePath: string): Promise<string[]> => {
  const data = await fs.readFile(filePath, 'utf-8');
  return data.split(/\r?\n/);
};

export const readJson = async <T>(filePath: string): Promise<T> => {
  const data = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(data);
};

export const readJsonWithCommas = async <T>(filePath: string): Promise<T> => {
  const data = await fs.readFile(filePath, 'utf-8');
  const dataWithoutCommas = data.replace(
    /(?<=(true|false|null|["\d}\]])\s*)\s*,(?=\s*[}\]])/g,
    '',
  );

  return JSON.parse(dataWithoutCommas);
};

export const saveJson = async (
  filePath: string,
  json: unknown,
  { pretty = false }: { pretty?: boolean } = {},
) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const data = pretty ? JSON.stringify(json, null, 2) : JSON.stringify(json);
  return await fs.writeFile(filePath, data);
};

export const saveText = async (filePath: string, text: string) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  return await fs.writeFile(filePath, text);
};

export const deleteFile = async (filePath: string) => {
  return await fs.rm(filePath, { force: true });
};

export const copyDirectory = async (fromPath: string, toPath: string) => {
  await backup(toPath);
  await fs.rm(toPath, { recursive: true, force: true });
  return await fs.cp(fromPath, toPath, { recursive: true });
};

export const getChildJsonPaths = async (dirPath: string) => {
  const childNames = await fs.readdir(dirPath);
  const childJsonNames = childNames.filter((name) => name.endsWith('.json'));

  return childJsonNames.map((name) => path.resolve(dirPath, name));
};

export const getBackupDirectoryWithTime = (
  baseDir: string,
  postFix = '_backup_',
) => {
  const timePostfix = new Date()
    .toISOString()
    .replaceAll(/[-:]/g, '')
    .replace('T', '_')
    .slice(0, 15);

  return `${baseDir}${postFix}${timePostfix}`;
};

export const backup = async (
  baseDir: string,
  option: {
    filePaths?: string[];
    backupPath?: string;
    removeExistingBackup?: boolean;
    removeOriginal?: boolean;
  } = {},
) => {
  const {
    filePaths,
    backupPath,
    removeExistingBackup = true,
    removeOriginal = true,
  } = option;

  const backupTargets = filePaths ?? [''];
  const backupDir = backupPath ?? getBackupDirectoryWithTime(baseDir);

  if (removeExistingBackup) {
    await fs.rm(backupDir, { recursive: true, force: true });
    await fs.mkdir(backupDir, { recursive: true });
  }

  await batchPromiseAll(backupTargets, async (filePath) => {
    const absoluteFilePath = path.resolve(baseDir, filePath);
    const newPath = path.resolve(backupDir, filePath);

    try {
      await fs.cp(absoluteFilePath, newPath, { recursive: true });

      if (removeOriginal) {
        await fs.rm(absoluteFilePath, { recursive: true, force: true });
      }
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

export const dataChapterIdToFileGateId = (chapterId: number) =>
  Math.floor(chapterId / 10000);
export const dataChapterIdToFileChapterId = (chapterId: number) =>
  chapterId % 10000;
export const fileChapterIdToDataChapterId = (
  gateId: number,
  chapterId: number,
) => gateId * 10000 + chapterId;
