import {
  App,
  BrowserWindow,
  IpcMainInvokeEvent,
  dialog,
  ipcMain,
  shell,
} from 'electron';
import log from 'electron-log/main';
import { glob } from 'glob';
import path from 'node:path';

import {
  CREATE_GATE,
  DELETE_GATE,
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
  SAVE_SETTINGS,
  SHOW_MESSAGE_BOX,
  UPDATE_GATE,
} from '../common/channel';
import {
  CreateGateRequest,
  CreateGateResponse,
  DeleteGateRequest,
  ExportDataRequest,
  Gate,
  GateSummary,
  ImportDataRequest,
  ImportDeckRequest,
  ReadGateRequest,
  ReadGateResponse,
  ReadGatesRequest,
  ReadGatesResponse,
  Settings,
  ShowMessageBoxRequest,
  UpdateGateRequest,
} from '../common/type';
import { dataToFiles } from './task/dataToFiles';
import { filesToData } from './task/filesToData';
import {
  batchPromiseAll,
  copyDirectory,
  deleteFile,
  readJson,
  saveJson,
  toPosix,
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

const handleSaveFile = async (event: IpcMainInvokeEvent, path?: string) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  const { canceled, filePath } = await dialog.showSaveDialog(win, {
    defaultPath: path || undefined,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (canceled) return;

  return filePath;
};

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
  (app: App) => async (): Promise<Settings | undefined> => {
    return await readJson<Settings>(
      path.resolve(app.getPath('userData'), 'settings.json'),
    ).catch(() => undefined);
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
  { gatePath, deckPath, dataPath }: ImportDataRequest,
) => {
  await dataToFiles({ gatePath, deckPath, dataPath });
};

const handleExportData = async (
  _event: IpcMainInvokeEvent,
  { gatePath, deckPath, dataPath }: ExportDataRequest,
) => {
  await filesToData({ gatePath, deckPath, dataPath });
};

const handleReadGates = async (
  _event: IpcMainInvokeEvent,
  { gatePath }: ReadGatesRequest,
): Promise<ReadGatesResponse> => {
  const gatePaths = await glob(toPosix(path.resolve(gatePath, '**/*.json')));
  const gates = await batchPromiseAll(gatePaths, (gatePath) =>
    readJson<Gate>(gatePath).then(
      (gate): GateSummary => ({
        id: gate.id,
        parent_id: gate.parent_id,
        path: gatePath,
        name: gate.name,
        priority: gate.priority,
      }),
    ),
  );

  return { gates: gates.sort((a, b) => a.id - b.id) };
};

const handleReadGate = async (
  _event: IpcMainInvokeEvent,
  { filePath: filePath }: ReadGateRequest,
): Promise<ReadGateResponse> => {
  return { gate: await readJson(filePath) };
};

const handleCreateGate = async (
  event: IpcMainInvokeEvent,
  { gate, path: basePath }: CreateGateRequest,
): Promise<CreateGateResponse> => {
  const defaultPath = basePath && path.resolve(basePath, `${gate.name}.json`);
  const filePath = await handleSaveFile(event, defaultPath);
  if (!filePath) return {};

  await saveJson(filePath, gate);
  return { filePath };
};

const handleUpdateGate = async (
  _event: IpcMainInvokeEvent,
  { filePath, gate }: UpdateGateRequest,
) => {
  await saveJson(filePath, gate);
};

const handleDeleteGate = async (
  _event: IpcMainInvokeEvent,
  { filePath }: DeleteGateRequest,
) => {
  await deleteFile(filePath);
};

const handleImportDeck = async (
  _event: IpcMainInvokeEvent,
  { deckPath, dataPath }: ImportDeckRequest,
) => {
  const deckDataPath = path.resolve(dataPath, 'Players', 'Local', 'Decks');
  await copyDirectory(deckDataPath, deckPath);
};

const handleExportDeck = async (
  _event: IpcMainInvokeEvent,
  { deckPath, dataPath }: ImportDeckRequest,
) => {
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

  handleWithLog(IMPORT_DECK, handleImportDeck);
  handleWithLog(EXPORT_DECK, handleExportDeck);
};
