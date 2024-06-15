// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

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
  CreateStructureDeckRequest,
  DeleteGateRequest,
  DeleteStructureDeckRequest,
  ExportDataRequest,
  ExportDeckRequest,
  ImportDataRequest,
  ImportDeckRequest,
  ReadGateRequest,
  ReadGatesRequest,
  ReadStructureDeckRequest,
  ReadStructureDecksRequest,
  Settings,
  ShowMessageBoxRequest,
  UpdateGateRequest,
  UpdateStructureDeckRequest,
} from '../common/type';

// prettier-ignore
contextBridge.exposeInMainWorld('electron', {
  openDirectory: (path?: string) => ipcRenderer.invoke(OPEN_DIRECTORY, path),
  openFile: (path?: string) => ipcRenderer.invoke(OPEN_FILE, path),
  showMessageBox: (request: ShowMessageBoxRequest) => ipcRenderer.invoke(SHOW_MESSAGE_BOX, request),
  saveSettings: (settings: Settings) => ipcRenderer.invoke(SAVE_SETTINGS, settings),
  loadSettings: () => ipcRenderer.invoke(LOAD_SETTINGS),
  openSettingsFile: () => ipcRenderer.invoke(OPEN_SETTINGS_FILE),
  openLogFile: () => ipcRenderer.invoke(OPEN_LOG_FILE),
  importData: (request: ImportDataRequest) => ipcRenderer.invoke(IMPORT_DATA, request),
  exportData: (request: ExportDataRequest) => ipcRenderer.invoke(EXPORT_DATA, request),
  readGates: (request: ReadGatesRequest) => ipcRenderer.invoke(READ_GATES, request),
  readGate: (request: ReadGateRequest) => ipcRenderer.invoke(READ_GATE, request),
  createGate: (request: CreateGateRequest) => ipcRenderer.invoke(CREATE_GATE, request),
  updateGate: (request: UpdateGateRequest) => ipcRenderer.invoke(UPDATE_GATE, request),
  deleteGate: (request: DeleteGateRequest) => ipcRenderer.invoke(DELETE_GATE, request),
  readStructureDecks: (request: ReadStructureDecksRequest) => ipcRenderer.invoke(READ_STRUCTURE_DECKS, request),
  readStructureDeck: (request: ReadStructureDeckRequest) => ipcRenderer.invoke(READ_STRUCTURE_DECK, request),
  createStructureDeck: (request: CreateStructureDeckRequest) => ipcRenderer.invoke(CREATE_STRUCTURE_DECK, request),
  updateStructureDeck: (request: UpdateStructureDeckRequest) => ipcRenderer.invoke(UPDATE_STRUCTURE_DECK, request),
  deleteStructureDeck: (request: DeleteStructureDeckRequest) => ipcRenderer.invoke(DELETE_STRUCTURE_DECK, request),
  importDeck: (request: ImportDeckRequest) => ipcRenderer.invoke(IMPORT_DECK, request),
  exportDeck: (request: ExportDeckRequest) => ipcRenderer.invoke(EXPORT_DECK, request),
});
