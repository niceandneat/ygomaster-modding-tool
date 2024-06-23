import log from 'electron-log/main';
import { glob } from 'glob';
import path from 'node:path';

import {
  ChapterUnlock,
  DuelChapter,
  Gate,
  ItemUnlock,
  Reward,
  StructureDeck,
  isDuelChapter,
  isRewardChapter,
  isUnlockChapter,
} from '../../common/type';
import {
  DeckData,
  DuelData,
  GateData,
  SettingsFile,
  ShopFile,
  StructureDeckData,
} from '../type';
import {
  backup,
  batchPromiseAll,
  fileChapterIdToDataChapterId,
  getBackupDirectoryWithTime,
  getChildJsonPaths,
  readJson,
  readJsonc,
  saveJson,
  saveText,
  toPosix,
} from '../utils';
import {
  loadStructureDeckDescriptions,
  loadStructureDeckNames,
} from './dataToFiles';
import {
  isCustomStructureDeckId,
  isCustomStructureDeckPath,
} from './structure-deck';

interface Ids {
  unlockId: number;
  unlockItemId: number;
  rewardId: number;
}

export const filesToData = async (paths: {
  dataPath: string;
  gatePath: string;
  deckPath: string;
  structureDeckPath: string;
}) => {
  const { dataPath, gatePath, deckPath, structureDeckPath } = paths;
  const gates = await loadGates(gatePath);
  const deckPathMap = await loadDeckPathMap(deckPath);
  const structureDecks = await loadStructureDecks(structureDeckPath);

  const gateData = createGateData(gates);
  const duelDataList = await batchPromiseAll(
    gates.flatMap((gate) => gate.chapters).filter(isDuelChapter),
    (chapter) => createDuelData(chapter, deckPathMap),
  );
  const structureDeckDataList = await batchPromiseAll(
    structureDecks,
    (structure) => createStructureDeckData(structure, deckPathMap),
  );

  const backupPath = getBackupDirectoryWithTime(dataPath);
  await saveData({
    backupPath,
    dataPath,
    gates,
    gateData,
    duelDataList,
    structureDecks,
    structureDeckDataList,
  });
  await patchData({ backupPath, dataPath });
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

const loadStructureDecks = async (
  structureDeckPath: string,
): Promise<StructureDeck[]> => {
  const structureDeckPaths = await getChildJsonPaths(structureDeckPath);
  const structureDecks = await batchPromiseAll(
    structureDeckPaths,
    readJson<StructureDeck>,
  );

  return structureDecks.sort((a, b) => a.id - b.id);
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
      chapterData.npc_id = 1;
      chapterData.difficulty = chapter.difficulty;

      if (chapter.mydeck_reward?.length) {
        const reward = createReward(chapter.mydeck_reward);
        chapterData.mydeck_set_id = ids.rewardId;
        rewardField[ids.rewardId] = reward;
        ids.rewardId += 1;
      }

      if (chapter.rental_deck && chapter.rental_reward?.length) {
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

const createStructureDeckData = async (
  structure: StructureDeck,
  pathMap: Record<string, string>,
): Promise<StructureDeckData> => {
  const deck = await readJson<DeckData>(pathMap[structure.deck]);

  return {
    structure_id: structure.id,
    accessory: { box: structure.box, sleeve: structure.sleeve },
    focus: {
      ids: structure.focus.length === 3 ? structure.focus : [0, 0, 0],
      r: [1, 1, 1],
    },
    contents: { m: deck.m, e: deck.e, s: deck.s },
  };
};

const backupStructureDecks = async (dataPath: string, backupPath: string) => {
  const structureDeckPath = path.resolve(dataPath, 'StructureDecks');

  const allStructureDeckPaths = await getChildJsonPaths(structureDeckPath);
  const customStructureDeckPaths: string[] = [];
  const systemStructureDeckPaths: string[] = [];

  allStructureDeckPaths.forEach((name) => {
    if (isCustomStructureDeckPath(name)) {
      customStructureDeckPaths.push(name);
    } else {
      systemStructureDeckPaths.push(name);
    }
  });

  await backup(dataPath, {
    backupPath,
    filePaths: customStructureDeckPaths.map((p) => path.relative(dataPath, p)),
    removeExistingBackup: false,
  });

  await backup(dataPath, {
    backupPath,
    filePaths: systemStructureDeckPaths.map((p) => path.relative(dataPath, p)),
    removeExistingBackup: false,
    removeOriginal: false,
  });
};

const saveData = async (data: {
  backupPath: string;
  dataPath: string;
  gates: Gate[];
  gateData: GateData;
  duelDataList: DuelData[];
  structureDecks: StructureDeck[];
  structureDeckDataList: StructureDeckData[];
}) => {
  const {
    backupPath,
    dataPath,
    gates,
    gateData,
    duelDataList,
    structureDecks,
    structureDeckDataList,
  } = data;
  log.info('Start save data');

  // Backup original data
  await backup(dataPath, {
    backupPath,
    filePaths: [
      'SoloDuels',
      'Solo.json',
      'ClientData/SoloGateCards.txt',
      'ClientData/IDS/IDS_SOLO.txt',
    ],
  });
  await backupStructureDecks(dataPath, backupPath);
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

  // Create structure deck files
  await batchPromiseAll(structureDeckDataList, (structureData) =>
    saveJson(
      path.resolve(
        dataPath,
        'StructureDecks',
        `${structureData.structure_id}.json`,
      ),
      structureData,
    ),
  );
  log.info('Created structure deck files');

  // Create IDS_ITEM.txt & IDS_ITEMDESC.txt
  await backup(dataPath, {
    backupPath,
    filePaths: [
      'ClientData/IDS/IDS_ITEM.txt',
      'ClientData/IDS/IDS_ITEMDESC.txt',
    ],
    removeExistingBackup: false,
    removeOriginal: false,
  });

  const [structureDeckNames, structureDeckDescriptions] = await Promise.all([
    loadStructureDeckNames(dataPath),
    loadStructureDeckDescriptions(dataPath),
  ]);

  const existingStructureDecksInfo = Array.from(structureDeckNames.entries())
    .filter(([id]) => !isCustomStructureDeckId(id))
    .map(([id, name]) => {
      return { id, name, description: structureDeckDescriptions.get(id) };
    });

  let structureDeckName = '';
  let structureDeckDescription = '';

  [...existingStructureDecksInfo, ...structureDecks].forEach(
    ({ id, name, description = '' }) => {
      structureDeckName += `[IDS_ITEM.ID${id}]\n${name}\n`;
      structureDeckDescription += `[IDS_ITEMDESC.ID${id}]\n${description}\n`;
    },
  );

  await saveText(
    path.resolve(dataPath, 'ClientData/IDS/IDS_ITEM.txt'),
    structureDeckName,
  );
  await saveText(
    path.resolve(dataPath, 'ClientData/IDS/IDS_ITEMDESC.txt'),
    structureDeckDescription,
  );
  log.info('Created IDS_ITEM.txt & IDS_ITEMDESC.txt');
};

const patchData = async (data: { backupPath: string; dataPath: string }) => {
  const { backupPath, dataPath } = data;
  log.info('Start patch data');

  // Modify unlock condition of card packs
  const shop = await readJsonc<ShopFile>(path.resolve(dataPath, 'Shop.json'));
  Object.keys(shop.PackShop).map((key) => {
    delete shop.PackShop[key].unlockSecrets;
  });

  await backup(dataPath, {
    backupPath,
    filePaths: ['Shop.json'],
    removeExistingBackup: false,
  });
  await saveJson(path.resolve(dataPath, 'Shop.json'), shop);
  log.info('Created Shop.json');

  // Modify general game settings
  const settings = await readJsonc<SettingsFile>(
    path.resolve(dataPath, 'Settings.json'),
  );
  settings.DefaultGems = 1100;
  settings.Craft.Craft.SuperRare.Normal = 50;
  settings.Craft.Craft.UltraRare.Normal = 50;
  settings.DuelRewards.win = [{ type: 'Gem', min: 100, max: 150, rate: 100 }];
  settings.DuelRewards.lose = [{ type: 'Gem', min: 10, max: 100, rate: 100 }];

  await backup(dataPath, {
    backupPath,
    filePaths: ['Settings.json'],
    removeExistingBackup: false,
  });
  await saveJson(path.resolve(dataPath, 'Settings.json'), settings);
  log.info('Created Settings.json');
};
