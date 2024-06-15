import {
  App,
  BrowserWindow,
  IpcMainInvokeEvent,
  dialog,
  ipcMain,
  shell,
} from 'electron';
import log from 'electron-log/main';
import path from 'node:path';

import {
  CREATE_GATE,
  CREATE_STRUCTURE_DECK,
  DELETE_GATE,
  DELETE_STRUCTURE_DECK,
  EXPORT_DATA,
  EXPORT_DECK,
  IMPORT_DATA,
  IMPORT_DECK,
  LOAD_SETTINGS,
  OPEN_DIRECTORY,
  OPEN_FILE,
  OPEN_LOG_FILE,
  OPEN_SETTINGS_FILE,
  READ_GATE,
  READ_GATES,
  READ_STRUCTURE_DECK,
  READ_STRUCTURE_DECKS,
  SAVE_SETTINGS,
  SHOW_MESSAGE_BOX,
  UPDATE_GATE,
  UPDATE_STRUCTURE_DECK,
} from '../common/channel';
import {
  CreateGateRequest,
  CreateGateResponse,
  CreateStructureDeckRequest,
  CreateStructureDeckResponse,
  DeleteGateRequest,
  DeleteStructureDeckRequest,
  ExportDataRequest,
  Gate,
  GateSummary,
  ImportDataRequest,
  ImportDeckRequest,
  LoadSettingsResponse,
  ReadGateRequest,
  ReadGateResponse,
  ReadGatesRequest,
  ReadGatesResponse,
  ReadStructureDeckRequest,
  ReadStructureDeckResponse,
  ReadStructureDecksRequest,
  ReadStructureDecksResponse,
  Settings,
  ShowMessageBoxRequest,
  StructureDeck,
  UpdateGateRequest,
  UpdateStructureDeckRequest,
} from '../common/type';
import { dataToFiles } from './task/dataToFiles';
import { filesToData } from './task/filesToData';
import { getPaths, setupFilesDirectories } from './task/settings';
import {
  batchPromiseAll,
  copyDirectory,
  deleteFile,
  getChildJsonPaths,
  readJson,
  saveJson,
} from './utils';

const handleOpenDirectory = async (
  event: IpcMainInvokeEvent,
  path?: string,
) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    defaultPath: path || undefined,
    properties: ['openDirectory'],
  });
  if (canceled) return;

  return filePaths[0];
};

const handleOpenFile = async (event: IpcMainInvokeEvent, path?: string) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    defaultPath: path || undefined,
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  });
  if (canceled) return;

  return filePaths[0];
};

// const handleSaveFile = async (event: IpcMainInvokeEvent, path?: string) => {
//   const win = BrowserWindow.fromWebContents(event.sender);
//   if (!win) return;

//   const { canceled, filePath } = await dialog.showSaveDialog(win, {
//     defaultPath: path || undefined,
//     filters: [{ name: 'JSON', extensions: ['json'] }],
//   });
//   if (canceled) return;

//   return filePath;
// };

const handleShowMessageBox = async (
  event: IpcMainInvokeEvent,
  { message, detail, buttons, cancelId, type }: ShowMessageBoxRequest,
) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  const { response } = await dialog.showMessageBox(win, {
    message,
    detail,
    buttons,
    cancelId,
    type,
  });

  return response;
};

const handleSaveSettings =
  (app: App) => async (_event: IpcMainInvokeEvent, settings: Settings) => {
    await saveJson(
      path.resolve(app.getPath('userData'), 'settings.json'),
      settings,
      { pretty: true },
    );
  };

const handleLoadSettings =
  (app: App) => async (): Promise<LoadSettingsResponse> => {
    const settings = await readJson<Settings>(
      path.resolve(app.getPath('userData'), 'settings.json'),
    ).catch(() => undefined);

    await setupFilesDirectories(settings?.filesPath);

    return { settings, paths: getPaths(settings?.filesPath) };
  };

const handleOpenSettingsFile = (app: App) => async (): Promise<string> => {
  return await shell.openPath(
    path.resolve(app.getPath('userData'), 'settings.json'),
  );
};

const handleOpenLogFile = (app: App) => async (): Promise<string> => {
  return await shell.openPath(
    path.resolve(app.getPath('userData'), 'main.log'),
  );
};

const handleImportData = async (
  _event: IpcMainInvokeEvent,
  { dataPath, filesPath }: ImportDataRequest,
) => {
  const { gatePath, deckPath, structureDeckPath } = getPaths(filesPath);

  await dataToFiles({ dataPath, gatePath, deckPath, structureDeckPath });
};

const handleExportData = async (
  _event: IpcMainInvokeEvent,
  { dataPath, filesPath }: ExportDataRequest,
) => {
  const { gatePath, deckPath, structureDeckPath } = getPaths(filesPath);

  await filesToData({ dataPath, gatePath, deckPath, structureDeckPath });
};

const handleReadGates = async (
  _event: IpcMainInvokeEvent,
  { filesPath }: ReadGatesRequest,
): Promise<ReadGatesResponse> => {
  const { gatePath } = getPaths(filesPath);

  const gatePaths = await getChildJsonPaths(gatePath);
  const gates = await batchPromiseAll(gatePaths, (gatePath) =>
    readJson<Gate>(gatePath).then(
      (gate): GateSummary => ({
        id: gate.id,
        parent_id: gate.parent_id,
        name: gate.name,
        priority: gate.priority,
      }),
    ),
  );

  return { gates: gates.sort((a, b) => a.id - b.id) };
};

const handleReadGate = async (
  _event: IpcMainInvokeEvent,
  { id, filesPath }: ReadGateRequest,
): Promise<ReadGateResponse> => {
  const { gatePath } = getPaths(filesPath);
  const filePath = path.resolve(gatePath, `${id}.json`);

  return { gate: await readJson(filePath) };
};

const handleCreateGate = async (
  _event: IpcMainInvokeEvent,
  { gate, filesPath }: CreateGateRequest,
): Promise<CreateGateResponse> => {
  const { gatePath } = getPaths(filesPath);
  const filePath = path.resolve(gatePath, `${gate.id}.json`);

  await saveJson(filePath, gate);
  return { gate };
};

const handleUpdateGate = async (
  _event: IpcMainInvokeEvent,
  { gate, prevId, filesPath }: UpdateGateRequest,
) => {
  const { gatePath } = getPaths(filesPath);
  const prevGatePath = path.resolve(gatePath, `${prevId}.json`);
  const newFilePath = path.resolve(gatePath, `${gate.id}.json`);

  // When ID changes, delete old file.
  if (prevGatePath !== newFilePath) {
    await deleteFile(prevGatePath);
  }

  await saveJson(newFilePath, gate);
  return { gate };
};

const handleDeleteGate = async (
  _event: IpcMainInvokeEvent,
  { id, filesPath }: DeleteGateRequest,
) => {
  const { gatePath } = getPaths(filesPath);
  const filePath = path.resolve(gatePath, `${id}.json`);

  await deleteFile(filePath);
};

const handleReadStructureDecks = async (
  _event: IpcMainInvokeEvent,
  { filesPath }: ReadStructureDecksRequest,
): Promise<ReadStructureDecksResponse> => {
  const { structureDeckPath } = getPaths(filesPath);

  const structureDeckPaths = await getChildJsonPaths(structureDeckPath);
  const structureDecks = await batchPromiseAll(
    structureDeckPaths,
    (structureDeckPath) => readJson<StructureDeck>(structureDeckPath),
  );

  return { structureDecks: structureDecks.sort((a, b) => a.id - b.id) };
};

const handleReadStructureDeck = async (
  _event: IpcMainInvokeEvent,
  { id, filesPath }: ReadStructureDeckRequest,
): Promise<ReadStructureDeckResponse> => {
  const { structureDeckPath } = getPaths(filesPath);
  const filePath = path.resolve(structureDeckPath, `${id}.json`);

  return { structureDeck: await readJson(filePath) };
};

const handleCreateStructureDeck = async (
  _event: IpcMainInvokeEvent,
  { structureDeck, filesPath }: CreateStructureDeckRequest,
): Promise<CreateStructureDeckResponse> => {
  const { structureDeckPath } = getPaths(filesPath);
  const filePath = path.resolve(structureDeckPath, `${structureDeck.id}.json`);

  await saveJson(filePath, structureDeck);
  return { structureDeck };
};

const handleUpdateStructureDeck = async (
  _event: IpcMainInvokeEvent,
  { structureDeck, prevId, filesPath }: UpdateStructureDeckRequest,
) => {
  const { structureDeckPath } = getPaths(filesPath);
  const prevStructureDeckPath = path.resolve(
    structureDeckPath,
    `${prevId}.json`,
  );
  const newFilePath = path.resolve(
    structureDeckPath,
    `${structureDeck.id}.json`,
  );

  // When ID changes, delete old file.
  if (prevStructureDeckPath !== newFilePath) {
    await deleteFile(prevStructureDeckPath);
  }

  await saveJson(newFilePath, structureDeck);
  return { structureDeck };
};

const handleDeleteStructureDeck = async (
  _event: IpcMainInvokeEvent,
  { id, filesPath }: DeleteStructureDeckRequest,
) => {
  const { structureDeckPath } = getPaths(filesPath);
  const filePath = path.resolve(structureDeckPath, `${id}.json`);

  await deleteFile(filePath);
};

const handleImportDeck = async (
  _event: IpcMainInvokeEvent,
  { dataPath, filesPath }: ImportDeckRequest,
) => {
  const { deckPath } = getPaths(filesPath);
  const deckDataPath = path.resolve(dataPath, 'Players', 'Local', 'Decks');

  await copyDirectory(deckDataPath, deckPath);
};

const handleExportDeck = async (
  _event: IpcMainInvokeEvent,
  { dataPath, filesPath }: ImportDeckRequest,
) => {
  const { deckPath } = getPaths(filesPath);
  const deckDataPath = path.resolve(dataPath, 'Players', 'Local', 'Decks');

  await copyDirectory(deckPath, deckDataPath);
};

const handleWithLog: typeof ipcMain.handle = (chanel, handler) => {
  return ipcMain.handle(chanel, async (event, ...args) => {
    log.info('[REQUEST]', chanel, ...args);
    const result = await handler(event, ...args);
    log.info('[RESPONSE]', chanel, result);
    return result;
  });
};

export const handleIpc = (app: App) => {
  handleWithLog(OPEN_DIRECTORY, handleOpenDirectory);
  handleWithLog(OPEN_FILE, handleOpenFile);
  handleWithLog(SHOW_MESSAGE_BOX, handleShowMessageBox);

  handleWithLog(SAVE_SETTINGS, handleSaveSettings(app));
  handleWithLog(LOAD_SETTINGS, handleLoadSettings(app));
  handleWithLog(OPEN_SETTINGS_FILE, handleOpenSettingsFile(app));
  handleWithLog(OPEN_LOG_FILE, handleOpenLogFile(app));

  handleWithLog(IMPORT_DATA, handleImportData);
  handleWithLog(EXPORT_DATA, handleExportData);

  handleWithLog(READ_GATES, handleReadGates);
  handleWithLog(READ_GATE, handleReadGate);
  handleWithLog(CREATE_GATE, handleCreateGate);
  handleWithLog(UPDATE_GATE, handleUpdateGate);
  handleWithLog(DELETE_GATE, handleDeleteGate);

  handleWithLog(READ_STRUCTURE_DECKS, handleReadStructureDecks);
  handleWithLog(READ_STRUCTURE_DECK, handleReadStructureDeck);
  handleWithLog(CREATE_STRUCTURE_DECK, handleCreateStructureDeck);
  handleWithLog(UPDATE_STRUCTURE_DECK, handleUpdateStructureDeck);
  handleWithLog(DELETE_STRUCTURE_DECK, handleDeleteStructureDeck);

  handleWithLog(IMPORT_DECK, handleImportDeck);
  handleWithLog(EXPORT_DECK, handleExportDeck);
};
