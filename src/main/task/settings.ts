import { app } from 'electron';
import * as fs from 'node:fs/promises';
import path from 'node:path';

import { SettingsPaths } from '../../common/type';

const DEFAULT_FILES_PATH = path.join(app.getAppPath(), 'files');

const getGatePath = (filesPath: string) => path.join(filesPath, 'gate');
const getDeckPath = (filesPath: string) => path.join(filesPath, 'deck');

export const getPaths = (filesPathInput?: string): SettingsPaths => {
  const filesPath = filesPathInput || DEFAULT_FILES_PATH;
  const gatePath = getGatePath(filesPath);
  const deckPath = getDeckPath(filesPath);

  return { gatePath, deckPath };
};

export const setupFilesDirectories = async (filesPath?: string) => {
  const { gatePath, deckPath } = getPaths(filesPath);
  console.log({ filesPath, gatePath, deckPath });

  await Promise.all([
    fs.mkdir(path.join(gatePath), { recursive: true }),
    fs.mkdir(path.join(deckPath), { recursive: true }),
  ]);
};
