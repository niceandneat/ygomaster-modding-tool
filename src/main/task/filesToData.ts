import log from 'electron-log/main';
import { glob } from 'glob';
import path from 'node:path';

import { Gate, Reward, Solo, Unlock } from '../../common/type';
import { ygoItems } from '../../common/ygoItems';
import {
  DataConsumItemValue,
  DataItemCategory,
  DataUnlockType,
  DeckData,
  DuelData,
  GateData,
  OrbStringToCode,
} from '../type';
import {
  backupFiles,
  batchPromiseAll,
  readJson,
  saveJson,
  saveText,
} from '../utils';

interface Ids {
  unlockId: number;
  unlockItemId: number;
  rewardId: number;
}

export const filesToData = async (paths: {
  gatePath: string;
  soloPath: string;
  deckPath: string;
  dataPath: string;
}) => {
  const { gatePath, soloPath, deckPath, dataPath } = paths;
  const gates = await loadGates(gatePath);
  const solos = await loadSolos(soloPath);
  const deckPathMap = await loadDeckPathMap(deckPath);

  const gateData = createGateData(gates, solos);
  const duelDataList = await batchPromiseAll(solos, (solo) =>
    createDuelData(solo, deckPathMap),
  );

  await saveData({ gates, solos, gateData, duelDataList, dataPath });
};

const loadGates = async (gatePath: string): Promise<Gate[]> => {
  const gatePaths = await glob(path.resolve(gatePath, '**/*.json'));
  const gates = await batchPromiseAll(gatePaths, readJson<Gate>);
  return gates.sort((a, b) => a.id - b.id);
};

const loadSolos = async (soloPath: string): Promise<Solo[]> => {
  const soloPaths = await glob(path.resolve(soloPath, '**/*.json'));
  const solos = await batchPromiseAll(soloPaths, readJson<Solo>);
  return solos.sort((a, b) => a.id - b.id);
};

const loadDeckPathMap = async (
  deckPath: string,
): Promise<Record<string, string>> => {
  const deckPaths = await glob(path.resolve(deckPath, '**/*.json'));

  return Object.fromEntries(
    deckPaths.map((deckPath) => [path.basename(deckPath), deckPath]),
  );
};

const createDuelData = async (
  solo: Solo,
  pathMap: Record<string, string>,
): Promise<DuelData> => {
  const cpuDeck = await readJson<DeckData>(pathMap[solo.cpu_deck]);
  const rentalDeck = solo.rental_deck
    ? await readJson<DeckData>(pathMap[solo.rental_deck])
    : cpuDeck;

  const field = getRandomItem(ygoItems.FIELD);

  return {
    chapter: solo.id,
    name: ['', solo.cpu_name],
    mat: repeat(field),
    duel_object: repeat(field + 10000),
    avatar_home: repeat(field + 20000),
    avatar: [0, getRandomItem(ygoItems.AVATAR)],
    sleeve: [0, getRandomItem(ygoItems.PROTECTOR)],
    icon: [0, getRandomItem(ygoItems.ICON)],
    icon_frame: [0, getRandomItem(ygoItems.ICON_FRAME)],
    hnum: [solo.player_hand, solo.cpu_hand],
    cpu: solo.cpu_value,
    cpuflag: solo.cpu_flag,
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

const createGateData = (gates: Gate[], solos: Solo[]): GateData => {
  const soloMap = new Map(solos.map((solo) => [solo.id, solo]));

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
    const { data, ids } = createSingleGateData(gate, soloMap, initialIds);

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
  solos: Map<number, Solo>,
  initialIds: Ids,
): { data: GateData; ids: Ids } => {
  const gateField: GateData['gate'][string] = {
    priority: gate.priority,
    parent_gate: gate.parent_id,
    view_gate: 0,
    unlock_id: 0,
    clear_chapter: gate.solos.at(-1)?.id || 0,
  };

  const chapterField: GateData['chapter'][string] = {};
  const unlockField: GateData['unlock'] = {};
  const unlockItemField: GateData['unlock_item'] = {};
  const rewardField: GateData['reward'] = {};
  const ids = { ...initialIds };

  gate.solos.forEach((soloInGate) => {
    const solo = solos.get(soloInGate.id);
    if (!solo) {
      return log.error(`Gate ${gate.id}: Solo ${soloInGate.id} not found`);
    }

    const chapter: GateData['chapter'][string][string] = {
      parent_chapter: soloInGate.parent_id,
      mydeck_set_id: 0,
      set_id: 0,
      unlock_id: 0,
      begin_sn: '',
      npc_id: 1,
    };

    const reward = createReward(solo.mydeck_reward);
    chapter.mydeck_set_id = ids.rewardId;
    rewardField[ids.rewardId] = reward;
    ids.rewardId += 1;

    if (solo.rental_reward?.length) {
      const reward = createReward(solo.rental_reward);
      chapter.set_id = ids.rewardId;
      rewardField[ids.rewardId] = reward;
      ids.rewardId += 1;
    }

    if (soloInGate.unlock?.length) {
      const { unlock, unlockItem } = createUnlock(
        soloInGate.unlock,
        ids.unlockItemId,
      );

      chapter.unlock_id = ids.unlockId;
      unlockField[ids.unlockId] = unlock;
      unlockItemField[ids.unlockItemId] = unlockItem;
      ids.unlockId += 1;
      ids.unlockItemId += 1;
    }

    chapterField[soloInGate.id] = chapter;
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

const createReward = (soloRewards: Reward[]) => {
  const reward: GateData['reward'][string] = {};

  soloRewards.forEach(({ category, value }) => {
    if (category === 'GEM') {
      return sumToExist(
        reward,
        DataItemCategory.CONSUME,
        DataConsumItemValue.Gem,
        value,
      );
    }

    if (category === 'CARD') {
      return sumToExist(reward, DataItemCategory.CARD, value, 1);
    }

    if (category === 'STRUCTURE') {
      return sumToExist(reward, DataItemCategory.STRUCTURE, value, 1);
    }

    sumToExist(
      reward,
      DataItemCategory.CONSUME,
      OrbStringToCode[category],
      value,
    );
  });

  return reward;
};

const createUnlock = (soloUnlocks: Unlock[], unlockItemId: number) => {
  const unlock: GateData['unlock'][string] = {
    [DataUnlockType.ITEM]: [unlockItemId],
  };

  const unlockItem: GateData['unlock_item'][string] = {
    [DataItemCategory.CONSUME]: Object.fromEntries(
      soloUnlocks.map(({ category, value }) => [
        OrbStringToCode[category],
        value,
      ]),
    ),
  };

  return { unlock, unlockItem };
};

const saveData = async (data: {
  gates: Gate[];
  solos: Solo[];
  gateData: GateData;
  duelDataList: DuelData[];
  dataPath: string;
}) => {
  const { gates, solos, gateData, duelDataList, dataPath } = data;
  log.info('Start save data');

  // Backup original files
  await backupFiles(
    [
      ...(await glob(path.resolve(dataPath, 'SoloDuels/*.json'))), // solo duels
      path.resolve(dataPath, 'Solo.json'),
      path.resolve(dataPath, 'ClientData/SoloGateCards.txt'),
      path.resolve(dataPath, 'ClientData/IDS/IDS_SOLO.txt'),
    ],
    dataPath,
  );
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
  const soloMap = new Map(solos.map((solo) => [solo.id, solo]));
  let soloDescriptions = '';
  gates.forEach(({ id, name, description, solos }) => {
    soloDescriptions += `[IDS_SOLO.GATE${id}]\n${name}\n`;
    soloDescriptions += `[IDS_SOLO.GATE${id}_EXPLANATION]\n${description}\n`;
    solos.forEach(({ id: soloId }) => {
      const solo = soloMap.get(soloId);
      if (!solo) return;

      soloDescriptions += `[IDS_SOLO.CHAPTER${solo.id}_EXPLANATION]\n${solo.description}\n`;
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
const getRandomItem = (ids: number[]) =>
  ids[Math.floor(ids.length * Math.random())];

const sumToExist = (
  reward: GateData['reward'][string],
  category: DataItemCategory,
  id: string | number,
  value: number,
) => {
  if (!reward[category]) reward[category] = {};
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (!reward[category]![id]) reward[category]![id] = 0;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  reward[category]![id] += value;
};
