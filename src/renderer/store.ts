import { create } from 'zustand';

import { Gate, GateSummary, Settings } from '../common/type';

interface State {
  settings: Settings;
  gates?: GateSummary[];
  activeGate?: Gate;
  setSettings: (settings: Settings) => void;
  loadGates: () => Promise<GateSummary[]>;
  loadActiveGate: (path: string) => Promise<Gate>;
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
  loadActiveGate: async (filePath: string) => {
    const { gate } = await window.electron.readGate({ filePath });
    set({ activeGate: gate });

    return gate;
  },
}));
