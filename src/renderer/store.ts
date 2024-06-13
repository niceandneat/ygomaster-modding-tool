import { create } from 'zustand';

import { GateSummary, Settings } from '../common/type';
import { dataStore } from './data';

interface State {
  settings: Settings;
  gates?: GateSummary[];
  setSettings: (settings: Settings) => void;
  loadGates: () => Promise<GateSummary[]>;
}

export const useAppStore = create<State>()((set, get) => ({
  settings: {
    dataPath: '',
    gatePath: '',
    deckPath: '',
    language: 'English',
  },
  setSettings: (inputSettings) => {
    set((state) => ({ settings: { ...state.settings, ...inputSettings } }));
    dataStore.setOption({ language: get().settings.language });
  },
  loadGates: async () => {
    const { gatePath } = get().settings;
    if (!gatePath) return [];

    const { gates } = await window.electron.readGates({ gatePath });
    set({ gates });

    return gates;
  },
}));
