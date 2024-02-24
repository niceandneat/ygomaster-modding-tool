import {
  CreateGateRequest,
  CreateGateResponse,
  CreateSoloRequest,
  CreateSoloResponse,
  DeleteGateRequest,
  DeleteSoloRequest,
  ExportDataRequest,
  ExportDeckRequest,
  ImportDataRequest,
  ImportDeckRequest,
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
  UpdateGateRequest,
  UpdateSoloRequest,
} from '../common/type';

export interface ElectronAPI {
  openDirectory: (path?: string) => Promise<string | undefined>;
  openFile: (path?: string) => Promise<string | undefined>;
  showMessageBox: (request: ShowMessageBoxRequest) => Promise<number>;
  saveSettings: (settings: Settings) => Promise<void>;
  loadSettings: () => Promise<Settings | undefined>;
  openSettingsFile: () => Promise<string>;
  openLogFile: () => Promise<string>;
  importData: (request: ImportDataRequest) => Promise<void>;
  exportData: (request: ExportDataRequest) => Promise<void>;
  readGates: (request: ReadGatesRequest) => Promise<ReadGatesResponse>;
  readGate: (request: ReadGateRequest) => Promise<ReadGateResponse>;
  createGate: (request: CreateGateRequest) => Promise<CreateGateResponse>;
  updateGate: (request: UpdateGateRequest) => Promise<void>;
  deleteGate: (request: DeleteGateRequest) => Promise<void>;
  readSolos: (request: ReadSolosRequest) => Promise<ReadSolosResponse>;
  readSolo: (request: ReadSoloRequest) => Promise<ReadSoloResponse>;
  createSolo: (request: CreateSoloRequest) => Promise<CreateSoloResponse>;
  updateSolo: (request: UpdateSoloRequest) => Promise<void>;
  deleteSolo: (request: DeleteSoloRequest) => Promise<void>;
  importDeck: (request: ImportDeckRequest) => Promise<void>;
  exportDeck: (request: ExportDeckRequest) => Promise<void>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
