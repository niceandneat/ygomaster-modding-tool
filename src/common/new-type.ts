export interface Gate {
  id: number; // 솔로 게이트 id
  parent_id: number; // 부모 솔로게이트 그룹 id (솔로게이트간 선행관계가 아님)
  name: string;
  description: string;
  illust_id: number; // 일러스트 카드 konami_id
  illust_x: number; // 일러스트 x offset
  illust_y: number; // 일러스트 y offset
  priority: number; // 노출 우선순위
  chapters: Chapter[];
}

export interface GateSummary {
  id: number;
  path: string;
  name: string;
  priority: number;
}

export type Chapter = DuelChapter | GateChapter;

export interface BaseChapter {
  id: number; // 솔로 id
  parent_id: number; // 0 이면 시작 솔로 / 0 이외이면 완료해야할 솔로 id
  description: string; // 솔로 description
}

export interface GateChapter extends BaseChapter {
  unlock: Unlock[]; // 이 필드가 존재할경우 듀얼하는 솔로가 아니며 아래 아이템을 필요로 함.
}

export interface DuelChapter extends BaseChapter {
  cpu_deck: string; // 상대방 덱. /data/solo 내의 모든 폴더에서 이름이 일치하는 덱을 찾기
  rental_deck?: string; // 렌탈 덱, 이 키값이 존재하지 않는 경우 렌탈덱 듀얼이 불가
  mydeck_reward: Reward[];
  rental_reward?: Reward[];
  cpu_hand: number; // 시작시 상대 손패 매수
  player_hand: number; // 시작시 플레이어 손패 매수
  cpu_name: string; // 상대방 이름
  cpu_flag: string; // cpuflag (ai 관련)
  cpu_value: number; // cpu의 성능. 100보다 98,97 이 더 뛰어나다는 커뮤니티 의견이 있다.
  // TODO 장식 요소 추가
}

export type Unlock = Item<ItemCategory.CONSUME>;
export type Reward = Item<ItemCategory>;

export interface Item<T extends ItemCategory = ItemCategory> {
  category: T;
  id: string;
  counts: number;
}

export enum ItemCategory {
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

export interface Settings {
  gatePath: string;
  deckPath: string;
  dataPath: string;
}

export const isGateChapter = (chapter: BaseChapter): chapter is GateChapter =>
  Boolean((chapter as GateChapter).unlock);
export const isDuelChapter = (chapter: BaseChapter): chapter is DuelChapter =>
  Boolean((chapter as DuelChapter).cpu_deck);

/**
 * DTOs
 */

export interface ShowMessageBoxRequest {
  message: string;
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
