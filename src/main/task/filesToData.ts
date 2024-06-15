import log from 'electron-log/main';
import { glob } from 'glob';
import path from 'node:path';

import {
  ChapterUnlock,
  DuelChapter,
  Gate,
  ItemUnlock,
  Reward,
  isDuelChapter,
  isRewardChapter,
  isUnlockChapter,
} from '../../common/type';
import { DeckData, DuelData, GateData, ShopFile } from '../type';
import {
  backupFiles,
  batchPromiseAll,
  fileChapterIdToDataChapterId,
  getChildJsonPaths,
  readJson,
  readJsonWithCommas,
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
  await patchData({ dataPath });
};

const loadGates = async (gatePath: string): Promise<Gate[]> => {
  const gatePaths = await getChildJsonPaths(gatePath);
  const gates = await batchPromiseAll(gatePaths, readJson<Gate>);

  return gates
    .map((gate) => ({
      ...gate,
      chapters: gate.chapters.map((chapter) => ({
        ...chapter,
        id: fileChapterIdToDataChapterId(gate.id, chapter.id),
        parent_id:
          chapter.parent_id &&
          fileChapterIdToDataChapterId(gate.id, chapter.parent_id),
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

  return {
    chapter: chapter.id,
    name: ['', chapter.cpu_name],
    mat: [chapter.player_mat, chapter.cpu_mat],
    sleeve: [chapter.player_sleeve, chapter.cpu_sleeve],
    icon: [chapter.player_icon, chapter.cpu_icon],
    icon_frame: [chapter.player_icon_frame, chapter.cpu_icon_frame],
    avatar: [chapter.player_avatar, chapter.cpu_avatar],
    avatar_home: [chapter.player_avatar_home, chapter.cpu_avatar_home],
    duel_object: [chapter.player_duel_object, chapter.cpu_duel_object],
    hnum: [chapter.player_hand, chapter.cpu_hand],
    life: [chapter.player_life, chapter.cpu_life],
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
      gate.clear_chapter.gateId,
      gate.clear_chapter.chapterId,
    ),
  };

  const chapterField: GateData['chapter'][string] = {};
  const unlockField: GateData['unlock'] = {};
  const unlockItemField: GateData['unlock_item'] = {};
  const rewardField: GateData['reward'] = {};
  const ids = { ...initialIds };

  if (gate.unlock.length) {
    const unlock = createChapterUnlock(gate.unlock);

    gateField.unlock_id = ids.unlockId;
    unlockField[ids.unlockId] = unlock;
    ids.unlockId += 1;
  }

  // TODO Remove this after PR merged
  const getSafeUnlockSecret = (unlockPacks?: number[]) => {
    if (!unlockPacks?.length) return;
    if (unlockPacks.length === 1) return unlockPacks[0];
    return unlockPacks;
  };

  gate.chapters.forEach((chapter) => {
    const chapterData: GateData['chapter'][string][string] = {
      parent_chapter: chapter.parent_id,
      mydeck_set_id: 0,
      set_id: 0,
      unlock_id: 0,
      begin_sn: '',
      npc_id: 1,
      difficulty: 0,
      unlock_secret: getSafeUnlockSecret(chapter.unlock_pack),
    };

    if (isUnlockChapter(chapter) && chapter.unlock.length) {
      const { unlock, unlockItem } = createItemUnlock(
        chapter.unlock,
        ids.unlockItemId,
      );

      chapterData.unlock_id = ids.unlockId;
      unlockField[ids.unlockId] = unlock;
      unlockItemField[ids.unlockItemId] = unlockItem;
      ids.unlockId += 1;
      ids.unlockItemId += 1;
      chapterData.npc_id = 0;
    }

    if (isRewardChapter(chapter) && chapter.reward.length) {
      const reward = createReward(chapter.reward);
      chapterData.set_id = ids.rewardId;
      rewardField[ids.rewardId] = reward;
      ids.rewardId += 1;
      chapterData.npc_id = 0;
    }

    if (isDuelChapter(chapter)) {
      const reward = createReward(chapter.mydeck_reward);
      chapterData.mydeck_set_id = ids.rewardId;
      rewardField[ids.rewardId] = reward;
      ids.rewardId += 1;
      chapterData.npc_id = 1;
      chapterData.difficulty = chapter.difficulty;

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

const createChapterUnlock = (gateUnlocks: ChapterUnlock[]) => {
  const unlock: GateData['unlock'][string] = {};
  gateUnlocks.forEach(({ type, gateId, chapterId }) => {
    unlock[type] = [
      ...(unlock[type] ?? []),
      fileChapterIdToDataChapterId(gateId, chapterId),
    ];
  });

  return unlock;
};

const createItemUnlock = (
  chapterUnlocks: ItemUnlock[],
  unlockItemId: number,
) => {
  const firstUnlockType = chapterUnlocks[0].type;
  const unlock: GateData['unlock'][string] = {
    [firstUnlockType]: [unlockItemId],
  };

  const unlockItem: GateData['unlock_item'][string] = {};
  chapterUnlocks
    // Only consider single type
    .filter(({ type }) => type === firstUnlockType)
    .forEach(({ category, id, counts }) => {
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

const patchData = async (data: { dataPath: string }) => {
  const { dataPath } = data;
  log.info('Start patch data');

  // Modify unlock condition of card packs
  const shop = await readJsonWithCommas<ShopFile>(
    path.resolve(dataPath, 'Shop.json'),
  );
  Object.keys(shop.PackShop).map((key) => {
    delete shop.PackShop[key].unlockSecrets;
  });

  await backupFiles(dataPath, ['Shop.json']);
  await saveJson(path.resolve(dataPath, 'Shop.json'), shop);
  log.info('Created Shop.json');
};
