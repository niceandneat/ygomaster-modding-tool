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
  name: string;
  priority: number;
}

export type Chapter = DuelChapter | UnlockChapter | RewardChapter;
export type ChapterType = 'Duel' | 'Unlock' | 'Reward';

export type BaseChapter = {
  id: number; // Solo id
  parent_id: number; // 0: this solo is the first one / other than 0: solo that needs to clear before this one
  description: string; // Solo description
  unlock_pack?: number[];
};

export type UnlockChapter = BaseChapter & {
  type: 'Unlock';
  unlock: ItemUnlock[]; // Items to unlock
};

export type RewardChapter = BaseChapter & {
  type: 'Reward';
  reward: Reward[];
};

export type DuelChapter = BaseChapter & {
  type: 'Duel';
  cpu_deck: string; // Opponent deck. Search every deck files in /data/solo directory recursively
  rental_deck?: string; // Needs to be set to enable rental deck match
  mydeck_reward: Reward[];
  rental_reward?: Reward[];
  difficulty: number;
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

export enum AssetCategory {
  CARD_PACK = 100,
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
  dataPath: string;
  filesPath?: string;
  language: 'English' | 'Korean';
}

export interface SettingsPaths {
  gatePath: string;
  deckPath: string;
}

export const isUnlockChapter = (
  chapter: BaseChapter,
): chapter is UnlockChapter =>
  Boolean((chapter as UnlockChapter).type === 'Unlock');
export const isRewardChapter = (
  chapter: BaseChapter,
): chapter is RewardChapter =>
  Boolean((chapter as RewardChapter).type === 'Reward');
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
  difficulty: 0,
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

export const defaultRewardChapter: RewardChapter = {
  id: 0,
  parent_id: 0,
  description: '',
  type: 'Reward',
  reward: [],
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
  dataPath: string;
  filesPath?: string;
}

export interface ExportDataRequest {
  dataPath: string;
  filesPath?: string;
}

export interface LoadSettingsResponse {
  settings?: Settings;
  paths: SettingsPaths;
}

export interface ReadGatesRequest {
  filesPath?: string;
}

export interface ReadGatesResponse {
  gates: GateSummary[];
}

export interface ReadGateRequest {
  id: number;
  filesPath?: string;
}

export interface ReadGateResponse {
  gate: Gate;
}

export interface CreateGateRequest {
  gate: Gate;
  filesPath?: string;
}

export interface CreateGateResponse {
  gate: Gate;
}

export interface UpdateGateRequest {
  gate: Gate;
  prevId: number;
  filesPath?: string;
}

export interface UpdateGateResponse {
  gate: Gate;
}

export interface DeleteGateRequest {
  id: number;
  filesPath?: string;
}

export interface ImportDeckRequest {
  dataPath: string;
  filesPath?: string;
}

export interface ExportDeckRequest {
  dataPath: string;
  filesPath?: string;
}
