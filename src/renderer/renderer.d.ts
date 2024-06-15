import {
  CreateGateRequest,
  CreateGateResponse,
  CreateStructureDeckRequest,
  CreateStructureDeckResponse,
  DeleteGateRequest,
  DeleteStructureDeckRequest,
  ExportDataRequest,
  ExportDeckRequest,
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
  UpdateGateRequest,
  UpdateGateResponse,
  UpdateStructureDeckRequest,
  UpdateStructureDeckResponse,
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
  readStructureDecks: (
    request: ReadStructureDecksRequest,
  ) => Promise<ReadStructureDecksResponse>;
  readStructureDeck: (
    request: ReadStructureDeckRequest,
  ) => Promise<ReadStructureDeckResponse>;
  createStructureDeck: (
    request: CreateStructureDeckRequest,
  ) => Promise<CreateStructureDeckResponse>;
  updateStructureDeck: (
    request: UpdateStructureDeckRequest,
  ) => Promise<UpdateStructureDeckResponse>;
  deleteStructureDeck: (request: DeleteStructureDeckRequest) => Promise<void>;
  importDeck: (request: ImportDeckRequest) => Promise<void>;
  exportDeck: (request: ExportDeckRequest) => Promise<void>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
