import log from 'electron-log/main';
import { glob } from 'glob';
import path from 'node:path';

import {
  Chapter,
  DuelChapter,
  Gate,
  GateChapter,
  ItemCategory,
  Reward,
  Unlock,
} from '../../common/type';
import {
  DataUnlockType,
  DeckData,
  DuelData,
  DuelDataFile,
  GateData,
  GateDataFile,
} from '../type';
import {
  backupFiles,
  batchPromiseAll,
  dataChaterIdToFileChapterId,
  readJson,
  readLines,
  saveJson,
  toPosix,
} from '../utils';

export const dataToFiles = async (paths: {
  gatePath: string;
  deckPath: string;
  dataPath: string;
}) => {
  const { gatePath, deckPath, dataPath } = paths;

  const gateData = await loadGateData(dataPath);
  const duelDataMap = await loadDuelDataList(dataPath);
  const gateIllustrations = await loadIllustrations(dataPath);
  const { gateNames, gateDescriptions, duelDescriptions } =
    await loadDescriptions(dataPath);

  const { gates, decks } = createGates({
    gateData,
    gateNames,
    gateDescriptions,
    gateIllustrations,
    duelDataMap,
    duelDescriptions,
  });

  await saveFiles({ gatePath, deckPath, gates, decks });
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
  const duelPaths = await glob(
    toPosix(path.resolve(dataPath, 'SoloDuels/*.json')),
  );
  const rawData = await batchPromiseAll(duelPaths, readJson<DuelDataFile>);

  return new Map(rawData.map((data) => [data.Duel.chapter, data.Duel]));
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
    const [gateId, cardId, xOffest, yOffset] = line.split(',').map(Number);
    gateIllustrations.set(gateId, {
      illust_id: cardId,
      illust_x: xOffest,
      illust_y: yOffset,
    });
  });

  return gateIllustrations;
};

const loadDescriptions = async (dataPath: string) => {
  const lines = await readLines(
    path.resolve(dataPath, 'ClientData/IDS/IDS_SOLO.txt'),
  );

  const gateNames = new Map<number, string>();
  const gateDescriptions = new Map<number, string>();
  const duelDescriptions = new Map<number, string>();

  let state = 'IDLE';
  let gateId = 0;
  let duelId = 0;
  let descriptions: string[] = [];

  const saveToMap = () => {
    const text = descriptions.join('\n');
    descriptions = [];

    if (state === 'DUEL_DESCRIPTION') return duelDescriptions.set(duelId, text);
    if (state === 'GATE_NAME') return gateNames.set(gateId, text);
    if (state === 'GATE_DESCRIPTION') return gateDescriptions.set(gateId, text);
  };

  lines.forEach((line) => {
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

    descriptions.push(line);
  });

  return { gateNames, gateDescriptions, duelDescriptions };
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

    const { chapters, decks } = createChapters({
      gateData,
      gateId,
      duelDataMap,
      duelDescriptions,
    });

    const gate: Gate = {
      id: gateId,
      name: gateNames.get(gateId) || '',
      description: gateDescriptions.get(gateId) || '',
      illust_id: gateIllustrations.get(gateId)?.illust_id || 4027, // Exodia
      illust_x: gateIllustrations.get(gateId)?.illust_x || 0,
      illust_y: gateIllustrations.get(gateId)?.illust_y || 0,
      priority: gateData.gate[gateId].priority,
      parent_id: gateData.gate[gateId].parent_gate,
      clear_chapter: gateData.gate[gateId].clear_chapter,
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
          chapter: createGateChapter({
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

const createGateChapter = (data: {
  gateData: GateData;
  gateId: number;
  chapterId: number;
  duelDescriptions: Map<number, string>;
}): GateChapter => {
  const { gateData, gateId, chapterId, duelDescriptions } = data;
  const chapterData = gateData.chapter[gateId][chapterId];

  return {
    id: dataChaterIdToFileChapterId(chapterId),
    parent_id:
      chapterData.parent_chapter &&
      dataChaterIdToFileChapterId(chapterData.parent_chapter),
    description: duelDescriptions.get(chapterId) ?? '',
    type: 'Gate',
    unlock: createUnlock({ gateData, gateId, chapterId }),
  };
};

const createUnlock = (data: {
  gateData: GateData;
  gateId: number;
  chapterId: number;
}): Unlock[] => {
  const { gateData, gateId, chapterId } = data;
  const chapterData = gateData.chapter[gateId][chapterId];
  const unlockData = gateData.unlock[chapterData.unlock_id];

  return (
    unlockData[DataUnlockType.ITEM]?.flatMap((id) => {
      const unlockConsumItems = gateData.unlock_item[id][ItemCategory.CONSUME];
      if (!unlockConsumItems) return [];

      return Object.entries(unlockConsumItems).map(
        ([itemId, counts]) =>
          ({
            category: ItemCategory.CONSUME,
            id: itemId,
            counts,
          }) satisfies Unlock,
      );
    }) ?? []
  );
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
  const myDeckReward = createReward(gateData, chapterData.mydeck_set_id);
  const cpuDeck = createDeck(duelData.Deck[1], cpuDeckName);
  decks.push(cpuDeck);

  const rentalDeckName = chapterData.set_id
    ? chapterData.set_id.toString()
    : undefined;
  const rentalDeckReward = chapterData.set_id
    ? createReward(gateData, chapterData.set_id)
    : undefined;
  const rentalDeck = rentalDeckName
    ? createDeck(duelData.Deck[0], rentalDeckName)
    : undefined;
  if (rentalDeck) decks.push(rentalDeck);

  const chapter: DuelChapter = {
    id: dataChaterIdToFileChapterId(chapterId),
    parent_id:
      chapterData.parent_chapter &&
      dataChaterIdToFileChapterId(chapterData.parent_chapter),
    description: duelDescriptions.get(chapterId) ?? '',
    type: 'Duel',
    cpu_deck: `${cpuDeckName}.json`,
    rental_deck: rentalDeckName && `${rentalDeckName}.json`,
    mydeck_reward: myDeckReward,
    rental_reward: rentalDeckReward,
    cpu_hand: duelData.hnum?.[1] ?? 5,
    player_hand: duelData.hnum?.[0] ?? 5,
    cpu_name: duelData.name[1],
    cpu_flag: duelData.cpuflag ?? 'None',
    cpu_value: duelData.cpu ?? 98,
    // TODO accessories
  };

  return { chapter, decks };
};

const createDeck = (
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

const createReward = (gateData: GateData, rewardId: number): Reward[] => {
  const rewardData = gateData.reward[rewardId];

  return Object.entries(rewardData).flatMap(([category, idCountsMap]) => {
    return Object.entries(idCountsMap).map(([id, counts]) => {
      return {
        category: category as ItemCategory,
        id,
        counts,
      } satisfies Reward;
    });
  });
};

const saveFiles = async (data: {
  gatePath: string;
  deckPath: string;
  gates: Gate[];
  decks: DeckData[];
}) => {
  const { gatePath, deckPath, gates, decks } = data;
  log.info('Start save files');

  await backupFiles(gatePath);
  await backupFiles(deckPath);
  log.info('Copied original files to backup folder');

  await batchPromiseAll(gates, (gate) =>
    saveJson(path.resolve(gatePath, `${gate.name}.json`), gate),
  );
  log.info('Created gate files');

  await batchPromiseAll(decks, (deck) =>
    saveJson(path.resolve(deckPath, `${deck.name}.json`), deck),
  );
  log.info('Created deck files');
};
