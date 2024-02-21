import {
  App,
  BrowserWindow,
  IpcMainInvokeEvent,
  dialog,
  ipcMain,
  shell,
} from 'electron';
import log from 'electron-log';
import { glob } from 'glob';
import path from 'node:path';

import {
  CREATE_GATE,
  CREATE_SOLO,
  DELETE_GATE,
  DELETE_SOLO,
  EXPORT_DATA,
  IMPORT_DATA,
  LOAD_SETTINGS,
  OPEN_DIRECTORY,
  OPEN_FILE,
  OPEN_LOG_FILE,
  OPEN_SETTINGS_FILE,
  READ_GATE,
  READ_GATES,
  READ_SOLO,
  READ_SOLOS,
  SAVE_SETTINGS,
  SHOW_MESSAGE_BOX,
  UPDATE_GATE,
  UPDATE_SOLO,
} from '../common/channel';
import {
  CreateGateRequest,
  CreateGateResponse,
  CreateSoloRequest,
  CreateSoloResponse,
  DeleteGateRequest,
  DeleteSoloRequest,
  ExportDataRequest,
  Gate,
  GateSummary,
  ImportDataRequest,
  ReadGateRequest,
  ReadGateResponse,
  ReadGatesRequest,
  ReadGatesResponse,
  ReadSoloRequest,
  ReadSoloResponse,
  ReadSolosRequest,
  ReadSolosResponse,
  Settings,
  ShowMessageBoxRequest,
  Solo,
  SoloSummary,
  UpdateGateRequest,
  UpdateSoloRequest,
} from '../common/type';
import { dataToFiles } from './task/dataToFiles';
import { filesToData } from './task/filesToData';
import { batchPromiseAll, deleteFile, readJson, saveJson } from './utils';

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
  { message, buttons, cancelId, type }: ShowMessageBoxRequest,
) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  const { response } = await dialog.showMessageBox(win, {
    message,
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
  { gatePath, soloPath, deckPath, dataPath }: ImportDataRequest,
) => {
  await dataToFiles({ gatePath, soloPath, deckPath, dataPath });
};

const handleExportData = async (
  _event: IpcMainInvokeEvent,
  { gatePath, soloPath, deckPath, dataPath }: ExportDataRequest,
) => {
  await filesToData({ gatePath, soloPath, deckPath, dataPath });
};

const handleReadGates = async (
  _event: IpcMainInvokeEvent,
  { gatePath }: ReadGatesRequest,
): Promise<ReadGatesResponse> => {
  const gatePaths = await glob(path.resolve(gatePath, '**/*.json'));
  const gates = await batchPromiseAll(
    gatePaths.map((gatePath) =>
      readJson<Gate>(gatePath).then(
        (gate): GateSummary => ({
          id: gate.id,
          path: gatePath,
          name: gate.name,
        }),
      ),
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
  { gate, path }: CreateGateRequest,
): Promise<CreateGateResponse> => {
  const filePath = await handleSaveFile(event, path);
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

const handleReadSolos = async (
  _event: IpcMainInvokeEvent,
  { soloPath }: ReadSolosRequest,
): Promise<ReadSolosResponse> => {
  const soloPaths = await glob(path.resolve(soloPath, '**/*.json'));
  const solos = await batchPromiseAll(
    soloPaths.map((soloPath) =>
      readJson<Solo>(soloPath).then(
        (solo): SoloSummary => ({
          id: solo.id,
          path: soloPath,
          deck: solo.cpu_deck,
        }),
      ),
    ),
  );

  return { solos: solos.sort((a, b) => a.id - b.id) };
};

const handleReadSolo = async (
  _event: IpcMainInvokeEvent,
  { filePath }: ReadSoloRequest,
): Promise<ReadSoloResponse> => {
  return { solo: await readJson(filePath) };
};

const handleCreateSolo = async (
  event: IpcMainInvokeEvent,
  { solo, path }: CreateSoloRequest,
): Promise<CreateSoloResponse> => {
  const filePath = await handleSaveFile(event, path);
  if (!filePath) return {};

  await saveJson(filePath, solo);
  return { filePath };
};

const handleUpdateSolo = async (
  _event: IpcMainInvokeEvent,
  { filePath, solo }: UpdateSoloRequest,
) => {
  await saveJson(filePath, solo);
};

const handleDeleteSolo = async (
  _event: IpcMainInvokeEvent,
  { filePath }: DeleteSoloRequest,
) => {
  await deleteFile(filePath);
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

  handleWithLog(READ_SOLOS, handleReadSolos);
  handleWithLog(READ_SOLO, handleReadSolo);
  handleWithLog(CREATE_SOLO, handleCreateSolo);
  handleWithLog(UPDATE_SOLO, handleUpdateSolo);
  handleWithLog(DELETE_SOLO, handleDeleteSolo);
};
