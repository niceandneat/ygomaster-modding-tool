export interface Gate {
  id: number; // Solo gate id
  parent_id: number; // Parent solo gate group id (not the order of gates)
  name: string;
  description: string;
  illust_id: number; // konami_id of a card for main image
  illust_x: number; // x offset of image above
  illust_y: number; // y offset of image above
  priority: number; // List order priority
  clear_chapter: ChapterReference;
  chapters: Chapter[];
  unlock: ChapterUnlock[];
}

export interface GateSummary {
  id: number;
  parent_id: number;
  path: string;
  name: string;
  priority: number;
}

export type Chapter = DuelChapter | UnlockChapter;
export type ChapterType = 'Duel' | 'Unlock';

export type BaseChapter = {
  id: number; // Solo id
  parent_id: number; // 0: this solo is the first one / other than 0: solo that needs to clear before this one
  description: string; // Solo description
};

export type UnlockChapter = BaseChapter & {
  type: 'Unlock';
  unlock: ItemUnlock[]; // Items to unlock
};

export type DuelChapter = BaseChapter & {
  type: 'Duel';
  cpu_deck: string; // Opponent deck. Search every deck files in /data/solo directory recursively
  rental_deck?: string; // Needs to be set to enable rental deck match
  mydeck_reward: Reward[];
  rental_reward?: Reward[];
  cpu_name: string; // Opponent name
  cpu_flag: string; // cpuflag (ai relative)
  cpu_value: number; // cpu performance
  player_hand: number; // Player start hand size
  cpu_hand: number; // Opponent start hand size
  player_life: number; // Player start life points
  cpu_life: number; // Opponent start life points
  player_mat: number;
  cpu_mat: number;
  player_sleeve: number;
  cpu_sleeve: number;
  player_icon: number;
  cpu_icon: number;
  player_icon_frame: number;
  cpu_icon_frame: number;
  player_avatar: number;
  cpu_avatar: number;
  player_avatar_home: number;
  cpu_avatar_home: number;
  player_duel_object: number;
  cpu_duel_object: number;
};

export interface Item<T extends ItemCategory = ItemCategory> {
  category: T;
  id: number;
  counts: number;
}

export enum ItemCategory {
  NONE = 0,
  CONSUME = 1,
  CARD = 2,
  AVATAR = 3,
  ICON = 4,
  PROFILE_TAG = 5,
  ICON_FRAME = 6,
  PROTECTOR = 7,
  DECK_CASE = 8,
  FIELD = 9,
  FIELD_OBJ = 10,
  AVATAR_HOME = 11,
  STRUCTURE = 12,
  WALLPAPER = 13,
  // PACK_TICKET = 14,
  // DECK_LIMIT = 15,
}

export interface ChapterReference {
  gateId: number;
  chapterId: number;
}

export enum UnlockType {
  // USER_LEVEL = 1, // Even official master duel does not use this
  CHAPTER_OR = 2,
  ITEM = 3,
  CHAPTER_AND = 4,
  HAS_ITEM = 5,
}

export type ChapterUnlock = ChapterReference & {
  type: UnlockType.CHAPTER_AND | UnlockType.CHAPTER_OR;
};

export type ItemUnlock = Item<ItemCategory> & {
  type: UnlockType.ITEM | UnlockType.HAS_ITEM;
};

export type Unlock = ChapterUnlock | ItemUnlock;
export type Reward = Item<ItemCategory>;

export interface Settings {
  gatePath: string;
  deckPath: string;
  dataPath: string;
}

export const isUnlockChapter = (
  chapter: BaseChapter,
): chapter is UnlockChapter =>
  Boolean((chapter as UnlockChapter).type === 'Unlock');
export const isDuelChapter = (chapter: BaseChapter): chapter is DuelChapter =>
  Boolean((chapter as DuelChapter).type === 'Duel');

export const isChapterUnlockType = (
  type: UnlockType,
): type is ChapterUnlock['type'] =>
  Boolean(type === UnlockType.CHAPTER_AND || type === UnlockType.CHAPTER_OR);
export const isItemUnlockType = (
  type: UnlockType,
): type is ItemUnlock['type'] =>
  Boolean(type === UnlockType.ITEM || type === UnlockType.HAS_ITEM);
export const isChapterUnlock = (unlock: Unlock): unlock is ChapterUnlock =>
  isChapterUnlockType(unlock.type);
export const isItemUnlock = (unlock: Unlock): unlock is ItemUnlock =>
  isItemUnlockType(unlock.type);

export const itemCategories: ItemCategory[] = Object.values(
  ItemCategory,
).filter((value): value is ItemCategory => typeof value === 'number');
export const unlockTypes: UnlockType[] = Object.values(UnlockType).filter(
  (value): value is UnlockType => typeof value === 'number',
);
export const chapterUnlockTypes: ChapterUnlock['type'][] =
  unlockTypes.filter(isChapterUnlockType);
export const itemUnlockTypes: ItemUnlock['type'][] =
  unlockTypes.filter(isItemUnlockType);

export const defaultDuelChapter: DuelChapter = {
  id: 0,
  parent_id: 0,
  description: '',
  type: 'Duel',
  cpu_deck: '',
  rental_deck: '',
  mydeck_reward: [],
  rental_reward: [],
  cpu_name: 'CPU',
  cpu_flag: 'None',
  cpu_value: 98,
  player_hand: 5,
  cpu_hand: 5,
  player_life: 8000,
  cpu_life: 8000,
  player_mat: 0,
  cpu_mat: 0,
  player_sleeve: 0,
  cpu_sleeve: 0,
  player_icon: 0,
  cpu_icon: 0,
  player_icon_frame: 0,
  cpu_icon_frame: 0,
  player_avatar: 0,
  cpu_avatar: 0,
  player_avatar_home: 0,
  cpu_avatar_home: 0,
  player_duel_object: 0,
  cpu_duel_object: 0,
};

export const defaultUnlockChapter: UnlockChapter = {
  id: 0,
  parent_id: 0,
  description: '',
  type: 'Unlock',
  unlock: [],
};

/**
 * DTO
 */

export interface ShowMessageBoxRequest {
  message: string;
  detail?: string;
  buttons: string[];
  type?: 'none' | 'info' | 'error' | 'question' | 'warning';
  cancelId?: number;
}

export interface ImportDataRequest {
  gatePath: string;
  deckPath: string;
  dataPath: string;
}

export interface ExportDataRequest {
  gatePath: string;
  deckPath: string;
  dataPath: string;
}

export interface ReadGatesRequest {
  gatePath: string;
}

export interface ReadGatesResponse {
  gates: GateSummary[];
}

export interface ReadGateRequest {
  filePath: string;
}

export interface ReadGateResponse {
  gate: Gate;
}

export interface CreateGateRequest {
  gate: Gate;
  path?: string;
}

export interface CreateGateResponse {
  filePath?: string;
}

export interface UpdateGateRequest {
  filePath: string;
  gate: Gate;
}

export interface DeleteGateRequest {
  filePath: string;
}

export interface ImportDeckRequest {
  deckPath: string;
  dataPath: string;
}

export interface ExportDeckRequest {
  deckPath: string;
  dataPath: string;
}
