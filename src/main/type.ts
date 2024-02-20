import { OrbItemCategory } from '../common/type';

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
        npc_id: number; // above 0
      };
    };
  };
  unlock: {
    [unlockId in string]: {
      [unlockType in DataUnlockType]?: number[]; // unlock item id
    };
  };
  unlock_item: {
    [unlockItemId in string]: {
      [itemCategory in DataItemCategory]?: {
        [itemId in string]: number; // counts
      };
    };
  };
  reward: {
    [rewardId in string]: {
      [itemCategory in DataItemCategory]?: {
        [itemId in string]: number; // counts
      };
    };
  };
}

export interface GateDataFile {
  Master: { Solo: GateData };
}

export enum DataUnlockType {
  USER_LEVEL = '1',
  CHAPTER_OR = '2',
  ITEM = '3',
  CHAPTER_AND = '4',
  HAS_ITEM = '5',
}

export enum DataItemCategory {
  NONE = '0',
  CONSUME = '1',
  CARD = '2',
  AVATAR = '3',
  ICON = '4',
  PROFILE_TAG = '5',
  ICON_FRAME = '6',
  PROTECTOR = '7',
  DECK_CASE = '8',
  FIELD = '9',
  FIELD_OBJ = '10',
  AVATAR_HOME = '11',
  STRUCTURE = '12',
  WALLPAPER = '13',
  PACK_TICKET = '14',
  DECK_LIMIT = '15',
}

export enum DataConsumItemValue {
  None = '0',
  Gem = '1',
  GemAlt = '2',
  CpN = '3',
  CpR = '4',
  CpSR = '5',
  CpUR = '6',
  OrbDark = '8',
  OrbLight = '9',
  OrbEarth = '10',
  OrbWater = '11',
  OrbFire = '12',
  OrbWind = '13',
}

export const OrbStringToCode = {
  DARK_ORB: DataConsumItemValue.OrbDark,
  LIGHT_ORB: DataConsumItemValue.OrbLight,
  EARTH_ORB: DataConsumItemValue.OrbEarth,
  WARTER_ORB: DataConsumItemValue.OrbWater,
  FIRE_ORB: DataConsumItemValue.OrbFire,
  WIND_ORB: DataConsumItemValue.OrbWind,
} satisfies Record<OrbItemCategory, DataConsumItemValue>;

export const OrbCodeToString = {
  [DataConsumItemValue.OrbDark]: 'DARK_ORB',
  [DataConsumItemValue.OrbLight]: 'LIGHT_ORB',
  [DataConsumItemValue.OrbEarth]: 'EARTH_ORB',
  [DataConsumItemValue.OrbWater]: 'WARTER_ORB',
  [DataConsumItemValue.OrbFire]: 'FIRE_ORB',
  [DataConsumItemValue.OrbWind]: 'WIND_ORB',
} satisfies Partial<Record<DataConsumItemValue, OrbItemCategory>>;
