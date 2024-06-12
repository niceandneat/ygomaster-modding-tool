import { ItemCategory, UnlockType } from '../common/type';

export interface DeckData {
  name: string;
  ct: number;
  et: number;
  regulation_id: number;
  regulation_name: string;
  accessory: {
    box: number;
    sleeve: number;
    field: number;
    object: number;
    av_base: number;
  };
  pick_cards: {
    ids: { 1: number; 2: number; 3: number };
    r: { 1: 1 | 2 | 3; 2: 1 | 2 | 3; 3: 1 | 2 | 3 };
  };
  m: {
    ids: number[];
    r: (1 | 2 | 3)[];
  };
  e: {
    ids: number[];
    r: (1 | 2 | 3)[];
  };
  s: {
    ids: number[];
    r: (1 | 2 | 3)[];
  };
}

export interface DuelData {
  chapter: number;
  name: [string, string]; // [player, cpu]
  mat: [number, number];
  avatar: [number, number];
  avatar_home: [number, number];
  duel_object: [number, number];
  icon: [number, number];
  icon_frame: [number, number];
  sleeve: [number, number];
  hnum?: [number, number];
  life?: [number, number];
  cpu?: number;
  cpuflag?: string;
  Deck: [
    {
      Main: {
        CardIds: number[];
        Rare: (1 | 2 | 3)[];
      };
      Extra: {
        CardIds: number[];
        Rare: (1 | 2 | 3)[];
      };
      Side: {
        CardIds: number[];
        Rare: (1 | 2 | 3)[];
      };
    },
    {
      Main: {
        CardIds: number[];
        Rare: (1 | 2 | 3)[];
      };
      Extra: {
        CardIds: number[];
        Rare: (1 | 2 | 3)[];
      };
      Side: {
        CardIds: number[];
        Rare: (1 | 2 | 3)[];
      };
    },
  ];
}

export interface DuelDataFile {
  Duel: DuelData;
}

export interface GateData {
  gate: {
    [gateId in string]: {
      priority: number;
      parent_gate: number;
      view_gate: number;
      unlock_id: number;
      clear_chapter: number;
    };
  };
  chapter: {
    [gateId in string]: {
      [chapterId in string]: {
        parent_chapter: number;
        mydeck_set_id: number;
        set_id: number;
        unlock_id: number;
        begin_sn: string; // ''
        npc_id: number; // 0 for unlock & reward / above 0 for duels
        unlock_secret?: number | number[];
      };
    };
  };
  unlock: {
    [unlockId in string]: {
      [unlockType in UnlockType]?: number[]; // unlock item id
    };
  };
  unlock_item: {
    [unlockItemId in string]: {
      [itemCategory in ItemCategory]?: {
        [itemId in string]: number; // counts
      };
    };
  };
  reward: {
    [rewardId in string]: {
      [itemCategory in ItemCategory]?: {
        [itemId in string]: number; // counts
      };
    };
  };
}

export interface GateDataFile {
  Master: { Solo: GateData };
}

// Only subset of fields are listed
export interface ShopFile {
  PackShop: {
    [packId in string]: {
      unlockSecrets?: number[];
    };
  };
}
