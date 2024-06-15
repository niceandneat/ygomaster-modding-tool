import { create } from 'zustand';

import { GateSummary, Settings, SettingsPaths } from '../common/type';
import { dataStore } from './data';

interface State {
  settings: Settings;
  paths: SettingsPaths;
  gates?: GateSummary[];
  saveSettings: (settings: Settings) => Promise<void>;
  loadSettings: () => Promise<void>;
  loadGates: () => Promise<GateSummary[]>;
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

    dataStore.setOption({ language: get().settings.language });
  },
  loadGates: async () => {
    const { filesPath } = get().settings;

    const { gates } = await window.electron.readGates({ filesPath });
    set({ gates });

    return gates;
  },
}));
