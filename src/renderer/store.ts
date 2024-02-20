import { create } from 'zustand';

import { Gate, GateSummary, Settings, Solo, SoloSummary } from '../common/type';

interface State {
  settings: Settings;
  gates?: GateSummary[];
  activeGate?: Gate;
  solos?: SoloSummary[];
  activeSolo?: Solo;
  setSettings: (settings: Settings) => void;
  loadGates: () => Promise<GateSummary[]>;
  loadActiveGate: (path: string) => Promise<Gate>;
  loadSolos: () => Promise<SoloSummary[]>;
  loadActiveSolo: (path: string) => Promise<Solo>;
}

export const useAppStore = create<State>()((set, get) => ({
  settings: {
    dataPath: '',
    gatePath: '',
    soloPath: '',
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
  loadSolos: async () => {
    const { soloPath } = get().settings;
    if (!soloPath) return [];

    const { solos } = await window.electron.readSolos({ soloPath });
    set({ solos });

    return solos;
  },
  loadActiveSolo: async (filePath: string) => {
    const { solo } = await window.electron.readSolo({ filePath });
    set({ activeSolo: solo });

    return solo;
  },
}));
