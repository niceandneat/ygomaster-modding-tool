import log from 'electron-log/main';
import path from 'node:path';

import {
  BaseChapter,
  Chapter,
  ChapterUnlock,
  DuelChapter,
  Gate,
  ItemCategory,
  ItemUnlock,
  Reward,
  RewardChapter,
  StructureDeck,
  UnlockChapter,
  chapterUnlockTypes,
  itemCategories,
  itemUnlockTypes,
} from '../../common/type';
import {
  DeckData,
  DuelData,
  DuelDataFile,
  GateData,
  GateDataFile,
  StructureDeckData,
} from '../type';
import {
  backup,
  batchPromiseAll,
  dataChapterIdToFileChapterId,
  dataChapterIdToFileGateId,
  getChildJsonPaths,
  readJson,
  readLines,
  saveJson,
} from '../utils';
import { isCustomStructureDeckPath } from './structure-deck';

export const dataToFiles = async (paths: {
  dataPath: string;
  gatePath: string;
  deckPath: string;
  structureDeckPath: string;
}) => {
  const { dataPath, gatePath, deckPath, structureDeckPath } = paths;

  const gateData = await loadGateData(dataPath);
  const duelDataMap = await loadDuelDataList(dataPath);
  const structureDeckDataList = await loadStructureDeckDataList(dataPath);
  const gateIllustrations = await loadIllustrations(dataPath);
  const { gateNames, gateDescriptions, duelDescriptions } =
    await loadGateAndDuelDescriptions(dataPath);
  const structureDeckNames = await loadStructureDeckNames(dataPath);
  const structureDeckDescriptions =
    await loadStructureDeckDescriptions(dataPath);

  const { gates, decks: decksFromGate } = createGates({
    gateData,
    gateNames,
    gateDescriptions,
    gateIllustrations,
    duelDataMap,
    duelDescriptions,
  });

  const { structureDecks, decks: decksFromStructure } = createStructureDecks({
    structureDeckDataList,
    structureDeckNames,
    structureDeckDescriptions,
  });

  const decks = mergeDecks(decksFromGate, decksFromStructure);

  await saveFiles({
    gatePath,
    deckPath,
    structureDeckPath,
    gates,
    decks,
    structureDecks,
  });
};

const loadGateData = async (dataPath: string): Promise<GateData> => {
  const rawData = await readJson<GateDataFile>(
    path.resolve(dataPath, 'Solo.json'),
  );

  return rawData.Master.Solo;
};

const loadDuelDataList = async (
  dataPath: string,
): Promise<Map<number, DuelData>> => {
  const duelPaths = await getChildJsonPaths(
    path.resolve(dataPath, 'SoloDuels'),
  );
  const rawData = await batchPromiseAll(duelPaths, readJson<DuelDataFile>);

  return new Map(rawData.map((data) => [data.Duel.chapter, data.Duel]));
};

const loadStructureDeckDataList = async (
  dataPath: string,
): Promise<StructureDeckData[]> => {
  const allStructureDeckPaths = await getChildJsonPaths(
    path.resolve(dataPath, 'StructureDecks'),
  );
  const customStructureDeckPaths = allStructureDeckPaths.filter(
    isCustomStructureDeckPath,
  );

  return await batchPromiseAll(
    customStructureDeckPaths,
    readJson<StructureDeckData>,
  );
};

const loadIllustrations = async (dataPath: string) => {
  const lines = await readLines(
    path.resolve(dataPath, 'ClientData/SoloGateCards.txt'),
  );

  const gateIllustrations = new Map<
    number,
    Pick<Gate, 'illust_id' | 'illust_x' | 'illust_y'>
  >();

  lines.forEach((line) => {
    const [gateId, cardId, xOffset, yOffset] = line.split(',').map(Number);
    gateIllustrations.set(gateId, {
      illust_id: cardId,
      illust_x: xOffset,
      illust_y: yOffset,
    });
  });

  return gateIllustrations;
};

const loadGateAndDuelDescriptions = async (dataPath: string) => {
  const lines = await readLines(
    path.resolve(dataPath, 'ClientData/IDS/IDS_SOLO.txt'),
  );

  const gateNames = new Map<number, string>();
  const gateDescriptions = new Map<number, string>();
  const duelDescriptions = new Map<number, string>();

  let state = 'IDLE';
  let gateId = 0;
  let duelId = 0;
  let contents: string[] = [];

  const saveToMap = () => {
    const text = contents.join('\n');
    contents = [];

    if (state === 'DUEL_DESCRIPTION') return duelDescriptions.set(duelId, text);
    if (state === 'GATE_NAME') return gateNames.set(gateId, text);
    if (state === 'GATE_DESCRIPTION') return gateDescriptions.set(gateId, text);
  };

  lines.filter(Boolean).forEach((line) => {
    const duelDescMatch = line.match(/\[IDS_SOLO\.CHAPTER(\d+)_EXPLANATION]/);
    if (duelDescMatch) {
      saveToMap();
      duelId = Number(duelDescMatch[1]);
      state = 'DUEL_DESCRIPTION';
      return;
    }

    const gateNameMatch = line.match(/\[IDS_SOLO\.GATE(\d+)]/);
    if (gateNameMatch) {
      saveToMap();
      gateId = Number(gateNameMatch[1]);
      state = 'GATE_NAME';
      return;
    }

    const gateDescMatch = line.match(/\[IDS_SOLO\.GATE(\d+)_EXPLANATION]/);
    if (gateDescMatch) {
      saveToMap();
      gateId = Number(gateDescMatch[1]);
      state = 'GATE_DESCRIPTION';
      return;
    }

    contents.push(line);
  });

  saveToMap();

  return { gateNames, gateDescriptions, duelDescriptions };
};

export const loadStructureDeckNames = async (dataPath: string) => {
  const lines = await readLines(
    path.resolve(dataPath, 'ClientData/IDS/IDS_ITEM.txt'),
  );

  const results = new Map<number, string>();

  let state = 'IDLE';
  let id = 0;
  let contents: string[] = [];

  const saveToMap = () => {
    const text = contents.join('\n');
    contents = [];

    if (state === 'STRUCTURE_DECK_NAME') return results.set(id, text);
  };

  lines.filter(Boolean).forEach((line) => {
    const match = line.match(/\[IDS_ITEM\.ID(\d+)]/);
    if (match) {
      saveToMap();
      id = Number(match[1]);
      state = 'STRUCTURE_DECK_NAME';
      return;
    }

    contents.push(line);
  });

  saveToMap();

  return results;
};

export const loadStructureDeckDescriptions = async (dataPath: string) => {
  const lines = await readLines(
    path.resolve(dataPath, 'ClientData/IDS/IDS_ITEMDESC.txt'),
  );

  const results = new Map<number, string>();

  let state = 'IDLE';
  let id = 0;
  let contents: string[] = [];

  const saveToMap = () => {
    const text = contents.join('\n');
    contents = [];

    if (state === 'STRUCTURE_DECK_DESCRIPTION') return results.set(id, text);
  };

  lines.filter(Boolean).forEach((line) => {
    const match = line.match(/\[IDS_ITEMDESC\.ID(\d+)]/);
    if (match) {
      saveToMap();
      id = Number(match[1]);
      state = 'STRUCTURE_DECK_DESCRIPTION';
      return;
    }

    contents.push(line);
  });

  saveToMap();

  return results;
};

const createGates = (data: {
  gateData: GateData;
  gateNames: Map<number, string>;
  gateDescriptions: Map<number, string>;
  gateIllustrations: Map<
    number,
    Pick<Gate, 'illust_id' | 'illust_x' | 'illust_y'>
  >;
  duelDataMap: Map<number, DuelData>;
  duelDescriptions: Map<number, string>;
}): { gates: Gate[]; decks: DeckData[] } => {
  const {
    gateData,
    gateNames,
    gateDescriptions,
    gateIllustrations,
    duelDataMap,
    duelDescriptions,
  } = data;

  const results = Object.keys(gateData.gate).map((gateKey) => {
    const gateId = Number(gateKey);

    const unlock = createChapterUnlock({ gateData, gateId });
    const { chapters, decks } = createChapters({
      gateData,
      gateId,
      duelDataMap,
      duelDescriptions,
    });

    const gate: Gate = {
      id: gateId,
      name: gateNames.get(gateId) ?? '',
      description: gateDescriptions.get(gateId) ?? '',
      illust_id: gateIllustrations.get(gateId)?.illust_id ?? 4027, // Exordia
      illust_x: gateIllustrations.get(gateId)?.illust_x ?? 0,
      illust_y: gateIllustrations.get(gateId)?.illust_y ?? 0,
      priority: gateData.gate[gateId].priority,
      parent_id: gateData.gate[gateId].parent_gate,
      clear_chapter: {
        gateId: dataChapterIdToFileGateId(gateData.gate[gateId].clear_chapter),
        chapterId: dataChapterIdToFileChapterId(
          gateData.gate[gateId].clear_chapter,
        ),
      },
      unlock,
      chapters,
    };

    return { gate, decks };
  });

  return {
    gates: results.map(({ gate }) => gate),
    decks: results.flatMap(({ decks }) => decks),
  };
};

const createChapters = (data: {
  gateData: GateData;
  gateId: number;
  duelDataMap: Map<number, DuelData>;
  duelDescriptions: Map<number, string>;
}): { chapters: Chapter[]; decks: DeckData[] } => {
  const { gateData, gateId, duelDataMap, duelDescriptions } = data;

  const results = Object.entries(gateData.chapter[gateId]).map(
    ([chapterKey, chapterData]) => {
      const chapterId = Number(chapterKey);

      if (chapterData.unlock_id) {
        return {
          chapter: createUnlockChapter({
            gateData,
            gateId,
            chapterId,
            duelDescriptions,
          }),
          decks: [],
        };
      }

      if (!chapterData.mydeck_set_id && !chapterData.npc_id) {
        return {
          chapter: createRewardChapter({
            gateData,
            gateId,
            chapterId,
            duelDescriptions,
          }),
          decks: [],
        };
      }

      return createDuelChapter({
        gateData,
        gateId,
        chapterId,
        duelDataMap,
        duelDescriptions,
      });
    },
  );

  return {
    chapters: results
      .map(({ chapter }) => chapter)
      .filter((c): c is Chapter => Boolean(c)),
    decks: results.flatMap(({ decks }) => decks),
  };
};

const createUnlockPack = (
  unlockSecret?: number | number[],
): number[] | undefined => {
  if (unlockSecret === undefined) return;
  if (typeof unlockSecret === 'number') return [unlockSecret];
  if (!unlockSecret.length) return [];
  return unlockSecret;
};

const createBaseChapter = (data: {
  gateData: GateData;
  gateId: number;
  chapterId: number;
  duelDescriptions: Map<number, string>;
}): BaseChapter => {
  const { gateData, gateId, chapterId, duelDescriptions } = data;
  const chapterData = gateData.chapter[gateId][chapterId];

  return {
    id: dataChapterIdToFileChapterId(chapterId),
    parent_id:
      chapterData.parent_chapter &&
      dataChapterIdToFileChapterId(chapterData.parent_chapter),
    description: duelDescriptions.get(chapterId) ?? '',
    unlock_pack: createUnlockPack(chapterData.unlock_secret),
  };
};

const createUnlockChapter = (data: {
  gateData: GateData;
  gateId: number;
  chapterId: number;
  duelDescriptions: Map<number, string>;
}): UnlockChapter => {
  const { gateData, gateId, chapterId, duelDescriptions } = data;

  return {
    ...createBaseChapter({ gateData, gateId, chapterId, duelDescriptions }),
    type: 'Unlock',
    unlock: createItemUnlock({ gateData, gateId, chapterId }),
  };
};

const createRewardChapter = (data: {
  gateData: GateData;
  gateId: number;
  chapterId: number;
  duelDescriptions: Map<number, string>;
}): RewardChapter => {
  const { gateData, gateId, chapterId, duelDescriptions } = data;
  const chapterData = gateData.chapter[gateId][chapterId];

  return {
    ...createBaseChapter({ gateData, gateId, chapterId, duelDescriptions }),
    type: 'Reward',
    reward: createReward(gateData, chapterData.set_id),
  };
};

const createChapterUnlock = (data: {
  gateData: GateData;
  gateId: number;
}): ChapterUnlock[] => {
  const { gateData, gateId } = data;
  const unlockId = gateData.gate[gateId].unlock_id;
  const unlockData = gateData.unlock[unlockId];
  if (!unlockData) return []; // When unlockId === 0

  const unlocks: ChapterUnlock[] = [];

  chapterUnlockTypes.forEach((unlockType) => {
    unlockData[unlockType]?.forEach((chapterId) => {
      unlocks.push({
        type: unlockType,
        gateId: dataChapterIdToFileGateId(chapterId),
        chapterId: dataChapterIdToFileChapterId(chapterId),
      } satisfies ChapterUnlock);
    });
  });

  return unlocks;
};

const createItemUnlock = (data: {
  gateData: GateData;
  gateId: number;
  chapterId: number;
}): ItemUnlock[] => {
  const { gateData, gateId, chapterId } = data;
  const unlockId = gateData.chapter[gateId][chapterId].unlock_id;
  const unlockData = gateData.unlock[unlockId];
  if (!unlockData) return []; // When unlockId === 0

  const unlocks: ItemUnlock[] = [];

  itemUnlockTypes.forEach((unlockType) => {
    unlockData[unlockType]?.forEach((id) => {
      itemCategories.forEach((itemCategory) => {
        const unlockItems = gateData.unlock_item[id][itemCategory];
        if (!unlockItems) return;

        Object.entries(unlockItems).forEach(([itemId, counts]) =>
          unlocks.push({
            type: unlockType,
            category: itemCategory,
            id: Number(itemId),
            counts,
          } satisfies ItemUnlock),
        );
      });
    });
  });

  return unlocks;
};

const createDuelChapter = (data: {
  gateData: GateData;
  gateId: number;
  chapterId: number;
  duelDataMap: Map<number, DuelData>;
  duelDescriptions: Map<number, string>;
}): { chapter?: DuelChapter; decks: DeckData[] } => {
  const { gateData, gateId, chapterId, duelDataMap, duelDescriptions } = data;
  const chapterData = gateData.chapter[gateId][chapterId];
  const duelData = duelDataMap.get(chapterId);

  if (!duelData) return { chapter: undefined, decks: [] };

  const decks: DeckData[] = [];

  const cpuDeckName = chapterData.mydeck_set_id.toString();
  const cpuDeck = createDeckFromDuel(duelData.Deck[1], cpuDeckName);
  decks.push(cpuDeck);

  const rentalDeckName = chapterData.set_id
    ? chapterData.set_id.toString()
    : undefined;
  const rentalDeck = rentalDeckName
    ? createDeckFromDuel(duelData.Deck[0], rentalDeckName)
    : undefined;
  if (rentalDeck) decks.push(rentalDeck);

  const myDeckReward = chapterData.mydeck_set_id
    ? createReward(gateData, chapterData.mydeck_set_id)
    : undefined;
  const rentalDeckReward = chapterData.set_id
    ? createReward(gateData, chapterData.set_id)
    : undefined;

  const chapter: DuelChapter = {
    ...createBaseChapter({ gateData, gateId, chapterId, duelDescriptions }),
    type: 'Duel',
    cpu_deck: `${cpuDeckName}.json`,
    rental_deck: rentalDeckName && `${rentalDeckName}.json`,
    mydeck_reward: myDeckReward,
    rental_reward: rentalDeckReward,
    difficulty: chapterData.difficulty ?? 0,
    cpu_name: duelData.name[1],
    cpu_flag: duelData.cpuflag ?? 'None',
    cpu_value: duelData.cpu ?? 98,
    player_hand: duelData.hnum?.[0] ?? 5,
    cpu_hand: duelData.hnum?.[1] ?? 5,
    player_life: duelData.life?.[0] ?? 8000,
    cpu_life: duelData.life?.[1] ?? 8000,
    player_mat: duelData.mat[0],
    cpu_mat: duelData.mat[1],
    player_sleeve: duelData.sleeve[0],
    cpu_sleeve: duelData.sleeve[1],
    player_icon: duelData.icon[0],
    cpu_icon: duelData.icon[1],
    player_icon_frame: duelData.icon_frame[0],
    cpu_icon_frame: duelData.icon_frame[1],
    player_avatar: duelData.avatar[0],
    cpu_avatar: duelData.avatar[1],
    player_avatar_home: duelData.avatar_home[0],
    cpu_avatar_home: duelData.avatar_home[1],
    player_duel_object: duelData.duel_object[0],
    cpu_duel_object: duelData.duel_object[1],
  };

  return { chapter, decks };
};

const createReward = (gateData: GateData, rewardId: number): Reward[] => {
  const rewardData = gateData.reward[rewardId];

  return Object.entries(rewardData).flatMap(([category, idCountsMap]) => {
    return Object.entries(idCountsMap).map(([id, counts]) => {
      return {
        category: Number(category) as ItemCategory,
        id: Number(id),
        counts,
      } satisfies Reward;
    });
  });
};

const createDeckFromDuel = (
  duelDeck: DuelData['Deck'][number],
  name: string,
): DeckData => {
  const now = Math.floor(new Date().getTime() / 1000);

  return {
    name,
    ct: now,
    et: now,
    m: { ids: duelDeck.Main.CardIds, r: duelDeck.Main.Rare },
    e: { ids: duelDeck.Extra.CardIds, r: duelDeck.Extra.Rare },
    s: { ids: duelDeck.Side.CardIds, r: duelDeck.Side.Rare },
    pick_cards: { ids: { 1: 0, 2: 0, 3: 0 }, r: { 1: 1, 2: 1, 3: 1 } },
    regulation_id: 1017,
    regulation_name: 'IDS_CARDMENU_REGULATION_NORMAL',
    accessory: {
      box: 1080001,
      sleeve: 1070001,
      field: 1090001,
      object: 1100001,
      av_base: 0,
    },
  };
};

const createDeckFromStructureDeck = (
  structureDeck: StructureDeckData,
  name: string,
): DeckData => {
  const now = Math.floor(new Date().getTime() / 1000);

  return {
    name,
    ct: now,
    et: now,
    m: { ids: structureDeck.contents.m.ids, r: structureDeck.contents.m.r },
    e: { ids: structureDeck.contents.e.ids, r: structureDeck.contents.e.r },
    s: { ids: structureDeck.contents.s.ids, r: structureDeck.contents.s.r },
    pick_cards: {
      ids: {
        1: structureDeck.focus.ids[0] ?? 0,
        2: structureDeck.focus.ids[1] ?? 0,
        3: structureDeck.focus.ids[2] ?? 0,
      },
      r: {
        1: structureDeck.focus.r[0] ?? 1,
        2: structureDeck.focus.r[1] ?? 1,
        3: structureDeck.focus.r[2] ?? 1,
      },
    },
    regulation_id: 1017,
    regulation_name: 'IDS_CARDMENU_REGULATION_NORMAL',
    accessory: {
      box: structureDeck.accessory.box,
      sleeve: structureDeck.accessory.sleeve,
      field: 1090001,
      object: 1100001,
      av_base: 0,
    },
  };
};

const createStructureDecks = (data: {
  structureDeckDataList: StructureDeckData[];
  structureDeckNames: Map<number, string>;
  structureDeckDescriptions: Map<number, string>;
}): { structureDecks: StructureDeck[]; decks: DeckData[] } => {
  const {
    structureDeckDataList,
    structureDeckNames,
    structureDeckDescriptions,
  } = data;

  const structureDecks: StructureDeck[] = [];
  const decks: DeckData[] = [];

  structureDeckDataList.forEach((structureDeckData) => {
    const deck = createDeckFromStructureDeck(
      structureDeckData,
      structureDeckNames.get(structureDeckData.structure_id) ??
        `${structureDeckData.structure_id}`,
    );

    const structureDeck: StructureDeck = {
      id: structureDeckData.structure_id,
      name: structureDeckNames.get(structureDeckData.structure_id) ?? '',
      description:
        structureDeckDescriptions.get(structureDeckData.structure_id) ?? '',
      box: structureDeckData.accessory.box,
      sleeve: structureDeckData.accessory.sleeve,
      deck: `${deck.name}.json`,
      focus: structureDeckData.focus.ids,
    };

    structureDecks.push(structureDeck);
    decks.push(deck);
  });

  return { structureDecks, decks };
};

const mergeDecks = (...decksList: DeckData[][]): DeckData[] => {
  const results: DeckData[] = [];
  const keys = new Set<string>();

  decksList.forEach((decks) => {
    decks.forEach((deck) => {
      if (keys.has(deck.name)) return;

      results.push(deck);
      keys.add(deck.name);
    });
  });

  return results;
};

const saveFiles = async (data: {
  gatePath: string;
  deckPath: string;
  structureDeckPath: string;
  gates: Gate[];
  decks: DeckData[];
  structureDecks: StructureDeck[];
}) => {
  const {
    gatePath,
    deckPath,
    structureDeckPath,
    gates,
    decks,
    structureDecks,
  } = data;
  log.info('Start save files');

  // backup files directory as a whole
  await backup(path.dirname(gatePath), {
    filePaths: [
      path.basename(gatePath),
      path.basename(deckPath),
      path.basename(structureDeckPath),
    ],
  });
  log.info('Copied original files to backup folder');

  await batchPromiseAll(gates, (gate) =>
    saveJson(path.resolve(gatePath, `${gate.id}.json`), gate),
  );
  log.info('Created gate files');

  await batchPromiseAll(structureDecks, (deck) =>
    saveJson(path.resolve(structureDeckPath, `${deck.id}.json`), deck),
  );
  log.info('Created structure deck files');

  await batchPromiseAll(decks, (deck) =>
    saveJson(path.resolve(deckPath, `${deck.name}.json`), deck),
  );
  log.info('Created deck files');
};
