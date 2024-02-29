import { create } from 'zustand';

import { GateSummary, Settings } from '../common/type';

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
  },
  setSettings: (settings) => set({ settings }),
  loadGates: async () => {
    const { gatePath } = get().settings;
    if (!gatePath) return [];

    const { gates } = await window.electron.readGates({ gatePath });
    set({ gates });

    return gates;
  },
}));
