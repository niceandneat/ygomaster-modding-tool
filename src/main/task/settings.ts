import { app } from 'electron';
import * as fs from 'node:fs/promises';
import path from 'node:path';

import { SettingsPaths } from '../../common/type';
import { getAppRoot } from '../utils';

const DEFAULT_FILES_PATH = path.join(getAppRoot(), 'files');

const getGatePath = (filesPath: string) => path.join(filesPath, 'gate');
const getDeckPath = (filesPath: string) => path.join(filesPath, 'deck');
const getStructureDeckPath = (filesPath: string) =>
  path.join(filesPath, 'structure');

export const getPaths = (filesPathInput?: string): SettingsPaths => {
  const filesPath = filesPathInput || DEFAULT_FILES_PATH;
  const gatePath = getGatePath(filesPath);
  const deckPath = getDeckPath(filesPath);
  const structureDeckPath = getStructureDeckPath(filesPath);

  return { gatePath, deckPath, structureDeckPath };
};

export const setupFilesDirectories = async (filesPath?: string) => {
  const { gatePath, deckPath, structureDeckPath } = getPaths(filesPath);

  await Promise.all([
    fs.mkdir(path.join(gatePath), { recursive: true }),
    fs.mkdir(path.join(deckPath), { recursive: true }),
    fs.mkdir(path.join(structureDeckPath), { recursive: true }),
  ]);
};
