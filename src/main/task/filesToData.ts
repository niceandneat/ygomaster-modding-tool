import log from 'electron-log/main';
import { glob } from 'glob';
import path from 'node:path';

import {
  DuelChapter,
  Gate,
  Reward,
  Unlock,
  isDuelChapter,
  isGateChapter,
} from '../../common/type';
import ygoItems from '../../data/items.json';
import { DataUnlockType, DeckData, DuelData, GateData } from '../type';
import {
  backupFiles,
  batchPromiseAll,
  fileChapterIdToDataChapterId,
  readJson,
  saveJson,
  saveText,
  toPosix,
} from '../utils';

interface Ids {
  unlockId: number;
  unlockItemId: number;
  rewardId: number;
}

export const filesToData = async (paths: {
  gatePath: string;
  deckPath: string;
  dataPath: string;
}) => {
  const { gatePath, deckPath, dataPath } = paths;
  const gates = await loadGates(gatePath);
  const deckPathMap = await loadDeckPathMap(deckPath);

  const gateData = createGateData(gates);
  const duelDataList = await batchPromiseAll(
    gates.flatMap((gate) => gate.chapters).filter(isDuelChapter),
    (chapter) => createDuelData(chapter, deckPathMap),
  );

  await saveData({ gates, gateData, duelDataList, dataPath });
};

const loadGates = async (gatePath: string): Promise<Gate[]> => {
  const gatePaths = await glob(toPosix(path.resolve(gatePath, '**/*.json')));
  const gates = await batchPromiseAll(gatePaths, readJson<Gate>);

  return gates
    .map((gate) => ({
      ...gate,
      chapters: gate.chapters.map((chapter) => ({
        ...chapter,
        id: fileChapterIdToDataChapterId(chapter.id, gate.id),
        parent_id:
          chapter.parent_id &&
          fileChapterIdToDataChapterId(chapter.parent_id, gate.id),
      })),
    }))
    .sort((a, b) => a.id - b.id);
};

const loadDeckPathMap = async (
  deckPath: string,
): Promise<Record<string, string>> => {
  const deckPaths = await glob(toPosix(path.resolve(deckPath, '**/*.json')));

  return Object.fromEntries(
    deckPaths.map((deckPath) => [path.basename(deckPath), deckPath]),
  );
};

const createDuelData = async (
  chapter: DuelChapter,
  pathMap: Record<string, string>,
): Promise<DuelData> => {
  const cpuDeck = await readJson<DeckData>(pathMap[chapter.cpu_deck]);
  const rentalDeck = chapter.rental_deck
    ? await readJson<DeckData>(pathMap[chapter.rental_deck])
    : cpuDeck;

  const field = getRandomItem(ygoItems.FIELD);

  return {
    chapter: chapter.id,
    name: ['', chapter.cpu_name],
    mat: repeat(field),
    duel_object: repeat(field + 10000),
    avatar_home: repeat(field + 20000),
    avatar: [0, getRandomItem(ygoItems.AVATAR)],
    sleeve: [0, getRandomItem(ygoItems.PROTECTOR)],
    icon: [0, getRandomItem(ygoItems.ICON)],
    icon_frame: [0, getRandomItem(ygoItems.ICON_FRAME)],
    hnum: [chapter.player_hand, chapter.cpu_hand],
    cpu: chapter.cpu_value,
    cpuflag: chapter.cpu_flag,
    Deck: [
      {
        Main: { CardIds: rentalDeck.m.ids, Rare: rentalDeck.m.r },
        Extra: { CardIds: rentalDeck.e.ids, Rare: rentalDeck.e.r },
        Side: { CardIds: [], Rare: [] },
      },
      {
        Main: { CardIds: cpuDeck.m.ids, Rare: cpuDeck.m.r },
        Extra: { CardIds: cpuDeck.e.ids, Rare: cpuDeck.e.r },
        Side: { CardIds: [], Rare: [] },
      },
    ],
  };
};

const createGateData = (gates: Gate[]): GateData => {
  const gateData: GateData = {
    gate: {},
    chapter: {},
    unlock: {},
    unlock_item: {},
    reward: {},
  };

  let initialIds: Ids = {
    unlockId: 1,
    unlockItemId: 1,
    rewardId: 1,
  };

  gates.forEach((gate) => {
    const { data, ids } = createSingleGateData(gate, initialIds);

    gateData.gate = { ...gateData.gate, ...data.gate };
    gateData.chapter = { ...gateData.chapter, ...data.chapter };
    gateData.unlock = { ...gateData.unlock, ...data.unlock };
    gateData.unlock_item = { ...gateData.unlock_item, ...data.unlock_item };
    gateData.reward = { ...gateData.reward, ...data.reward };
    initialIds = { ...ids };
  });

  return gateData;
};

const createSingleGateData = (
  gate: Gate,
  initialIds: Ids,
): { data: GateData; ids: Ids } => {
  const gateField: GateData['gate'][string] = {
    priority: gate.priority,
    parent_gate: gate.parent_id,
    view_gate: 0,
    unlock_id: 0,
    clear_chapter: fileChapterIdToDataChapterId(
      gate.clear_chapter || gate.chapters.at(-1)?.id || 0,
      gate.id,
    ),
  };

  const chapterField: GateData['chapter'][string] = {};
  const unlockField: GateData['unlock'] = {};
  const unlockItemField: GateData['unlock_item'] = {};
  const rewardField: GateData['reward'] = {};
  const ids = { ...initialIds };

  gate.chapters.forEach((chapter) => {
    const chapterData: GateData['chapter'][string][string] = {
      parent_chapter: chapter.parent_id,
      mydeck_set_id: 0,
      set_id: 0,
      unlock_id: 0,
      begin_sn: '',
      npc_id: 1,
    };

    if (isGateChapter(chapter)) {
      const { unlock, unlockItem } = createUnlock(
        chapter.unlock,
        ids.unlockItemId,
      );

      chapterData.unlock_id = ids.unlockId;
      unlockField[ids.unlockId] = unlock;
      unlockItemField[ids.unlockItemId] = unlockItem;
      ids.unlockId += 1;
      ids.unlockItemId += 1;
    }

    if (isDuelChapter(chapter)) {
      const reward = createReward(chapter.mydeck_reward);
      chapterData.mydeck_set_id = ids.rewardId;
      rewardField[ids.rewardId] = reward;
      ids.rewardId += 1;

      if (chapter.rental_deck && chapter.rental_reward) {
        const reward = createReward(chapter.rental_reward);
        chapterData.set_id = ids.rewardId;
        rewardField[ids.rewardId] = reward;
        ids.rewardId += 1;
      }
    }

    chapterField[chapter.id] = chapterData;
  });

  return {
    data: {
      gate: { [gate.id]: gateField },
      chapter: { [gate.id]: chapterField },
      unlock: unlockField,
      unlock_item: unlockItemField,
      reward: rewardField,
    },
    ids,
  };
};

const createReward = (chapterRewards: Reward[]) => {
  const reward: GateData['reward'][string] = {};
  chapterRewards.forEach(({ category, id, counts }) => {
    reward[category] = { ...reward[category], [id]: counts };
  });

  return reward;
};

const createUnlock = (chapterUnlocks: Unlock[], unlockItemId: number) => {
  const unlock: GateData['unlock'][string] = {
    [DataUnlockType.ITEM]: [unlockItemId],
  };

  const unlockItem: GateData['unlock_item'][string] = {};
  chapterUnlocks.forEach(({ category, id, counts }) => {
    unlockItem[category] = { ...unlockItem[category], [id]: counts };
  });

  return { unlock, unlockItem };
};

const saveData = async (data: {
  gates: Gate[];
  gateData: GateData;
  duelDataList: DuelData[];
  dataPath: string;
}) => {
  const { gates, gateData, duelDataList, dataPath } = data;
  log.info('Start save data');

  // Backup original files
  await backupFiles(dataPath, [
    'SoloDuels',
    'Solo.json',
    'ClientData/SoloGateCards.txt',
    'ClientData/IDS/IDS_SOLO.txt',
  ]);
  log.info('Copied original files to backup folder');

  // Create duel files
  await batchPromiseAll(duelDataList, (duelData) =>
    saveJson(path.resolve(dataPath, 'SoloDuels', `${duelData.chapter}.json`), {
      Duel: duelData,
    }),
  );
  log.info('Created duel files');

  // Create Solo.json
  await saveJson(path.resolve(dataPath, 'Solo.json'), {
    Master: { Solo: gateData },
  });
  log.info('Created Solo.json');

  // Create SoloGateCards.txt
  const soloGateCards = gates
    .map(
      ({ id, illust_id, illust_x, illust_y }) =>
        `${id},${illust_id},${illust_x},${illust_y}`,
    )
    .join('\n');
  await saveText(
    path.resolve(dataPath, 'ClientData/SoloGateCards.txt'),
    soloGateCards,
  );
  log.info('Created SoloGateCards.txt');

  // Create IDS_SOLO.txt
  let soloDescriptions = '';
  gates.forEach(({ id, name, description = '', chapters }) => {
    const paddedId = id.toString().padStart(3, '0');
    soloDescriptions += `[IDS_SOLO.GATE${paddedId}]\n${name}\n`;
    soloDescriptions += `[IDS_SOLO.GATE${paddedId}_EXPLANATION]\n${description}\n`;
    chapters.forEach((chapter) => {
      soloDescriptions += `[IDS_SOLO.CHAPTER${chapter.id}_EXPLANATION]\n${chapter.description}\n`;
    });
  });

  await saveText(
    path.resolve(dataPath, 'ClientData/IDS/IDS_SOLO.txt'),
    soloDescriptions,
  );
  log.info('Created IDS_SOLO.txt');
};

/**
 * Utilities
 */

const repeat = (id: number): [number, number] => [id, id];
const getRandomItem = (items: { id: string; name: string }[]) =>
  Number(items[Math.floor(items.length * Math.random())].id);
