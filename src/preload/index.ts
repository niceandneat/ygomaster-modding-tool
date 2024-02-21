// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

import {
  CREATE_GATE,
  CREATE_SOLO,
  DELETE_GATE,
  DELETE_SOLO,
  EXPORT_DATA,
  IMPORT_DATA,
  LOAD_CONFIG,
  OPEN_DIRECTORY,
  OPEN_FILE,
  READ_GATE,
  READ_GATES,
  READ_SOLO,
  READ_SOLOS,
  SAVE_CONFIG,
  SHOW_MESSAGE_BOX,
  UPDATE_GATE,
  UPDATE_SOLO,
} from '../common/channel';
import {
  CreateGateRequest,
  CreateSoloRequest,
  DeleteGateRequest,
  DeleteSoloRequest,
  ExportDataRequest,
  ImportDataRequest,
  ReadGateRequest,
  ReadGatesRequest,
  ReadSoloRequest,
  ReadSolosRequest,
  Settings,
  ShowMessageBoxRequest,
  UpdateGateRequest,
  UpdateSoloRequest,
} from '../common/type';

// prettier-ignore
contextBridge.exposeInMainWorld('electron', {
  openDirectory: (path?: string) => ipcRenderer.invoke(OPEN_DIRECTORY, path),
  openFile: (path?: string) => ipcRenderer.invoke(OPEN_FILE, path),
  showMessageBox: (request: ShowMessageBoxRequest) => ipcRenderer.invoke(SHOW_MESSAGE_BOX, request),
  saveSettings: (settings: Settings) => ipcRenderer.invoke(SAVE_CONFIG, settings),
  loadSettings: () => ipcRenderer.invoke(LOAD_CONFIG),
  importData: (request: ImportDataRequest) => ipcRenderer.invoke(IMPORT_DATA, request),
  exportData: (request: ExportDataRequest) => ipcRenderer.invoke(EXPORT_DATA, request),
  readGates: (request: ReadGatesRequest) => ipcRenderer.invoke(READ_GATES, request),
  readGate: (request: ReadGateRequest) => ipcRenderer.invoke(READ_GATE, request),
  createGate: (request: CreateGateRequest) => ipcRenderer.invoke(CREATE_GATE, request),
  updateGate: (request: UpdateGateRequest) => ipcRenderer.invoke(UPDATE_GATE, request),
  deleteGate: (request: DeleteGateRequest) => ipcRenderer.invoke(DELETE_GATE, request),
  readSolos: (request: ReadSolosRequest) => ipcRenderer.invoke(READ_SOLOS, request),
  readSolo: (request: ReadSoloRequest) => ipcRenderer.invoke(READ_SOLO, request),
  createSolo: (request: CreateSoloRequest) => ipcRenderer.invoke(CREATE_SOLO, request),
  updateSolo: (request: UpdateSoloRequest) => ipcRenderer.invoke(UPDATE_SOLO, request),
  deleteSolo: (request: DeleteSoloRequest) => ipcRenderer.invoke(DELETE_SOLO, request),
});
