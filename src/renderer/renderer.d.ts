import {
  CreateGateRequest,
  CreateGateResponse,
  DeleteGateRequest,
  ExportDataRequest,
  ExportDeckRequest,
  ImportDataRequest,
  ImportDeckRequest,
  LoadSettingsResponse,
  ReadGateRequest,
  ReadGateResponse,
  ReadGatesRequest,
  ReadGatesResponse,
  Settings,
  ShowMessageBoxRequest,
  UpdateGateRequest,
  UpdateGateResponse,
} from '../common/type';

export interface ElectronAPI {
  openDirectory: (path?: string) => Promise<string | undefined>;
  openFile: (path?: string) => Promise<string | undefined>;
  showMessageBox: (request: ShowMessageBoxRequest) => Promise<number>;
  saveSettings: (settings: Settings) => Promise<void>;
  loadSettings: () => Promise<LoadSettingsResponse>;
  openSettingsFile: () => Promise<string>;
  openLogFile: () => Promise<string>;
  importData: (request: ImportDataRequest) => Promise<void>;
  exportData: (request: ExportDataRequest) => Promise<void>;
  readGates: (request: ReadGatesRequest) => Promise<ReadGatesResponse>;
  readGate: (request: ReadGateRequest) => Promise<ReadGateResponse>;
  createGate: (request: CreateGateRequest) => Promise<CreateGateResponse>;
  updateGate: (request: UpdateGateRequest) => Promise<UpdateGateResponse>;
  deleteGate: (request: DeleteGateRequest) => Promise<void>;
  importDeck: (request: ImportDeckRequest) => Promise<void>;
  exportDeck: (request: ExportDeckRequest) => Promise<void>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
