import { create } from 'zustand';

import {
  GateSummary,
  Settings,
  SettingsPaths,
  StructureDeck,
} from '../common/type';
import { dataStore } from './data';

interface State {
  settings: Settings;
  paths: SettingsPaths;
  gates?: GateSummary[];
  structureDecks?: StructureDeck[];
  saveSettings: (settings: Settings) => Promise<void>;
  loadSettings: () => Promise<void>;
  loadGates: () => Promise<GateSummary[]>;
  loadStructureDecks: () => Promise<StructureDeck[]>;
}

export const useAppStore = create<State>()((set, get) => ({
  settings: {
    filesPath: '',
    dataPath: '',
    language: 'English',
  },
  paths: {
    deckPath: '',
    gatePath: '',
    structureDeckPath: '',
  },
  saveSettings: async (settings) => {
    await window.electron.saveSettings(settings);
    await get().loadSettings();
  },
  loadSettings: async () => {
    const { settings, paths } = await window.electron.loadSettings();

    set((state) => ({
      settings: { ...state.settings, ...settings },
      paths: { ...state.paths, ...paths },
    }));

    await get().loadGates();
    await get().loadStructureDecks();

    dataStore.setOption({
      language: get().settings.language,
      structureDecks: get().structureDecks,
    });
  },
  loadGates: async () => {
    const { filesPath } = get().settings;

    const { gates } = await window.electron.readGates({ filesPath });
    set({ gates });

    return gates;
  },
  loadStructureDecks: async () => {
    const { filesPath } = get().settings;

    const { structureDecks } = await window.electron.readStructureDecks({
      filesPath,
    });
    set({ structureDecks });

    return structureDecks;
  },
}));
