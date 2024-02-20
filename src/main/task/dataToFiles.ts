import log from 'electron-log/main';
import { glob } from 'glob';
import path from 'node:path';

import { Gate, Reward, Solo, SoloInGate, Unlock } from '../../common/type';
import {
  DataConsumItemValue,
  DataItemCategory,
  DataUnlockType,
  DeckData,
  DuelData,
  DuelDataFile,
  GateData,
  GateDataFile,
  OrbCodeToString,
} from '../type';
import {
  backupFiles,
  batchPromiseAll,
  readJson,
  readLines,
  saveJson,
} from '../utils';

export const dataToFiles = async (paths: {
  gatePath: string;
  soloPath: string;
  deckPath: string;
  dataPath: string;
}) => {
  const { gatePath, soloPath, deckPath, dataPath } = paths;

  const gateData = await loadGateData(dataPath);
  const duelDataList = await loadDuelDataList(dataPath);
  const gateIllustrations = await loadIllustrations(dataPath);
  const { gateNames, gateDescriptions, duelDescriptions } =
    await loadDescriptions(dataPath);

  const gates = createGates({
    gateData,
    gateNames,
    gateDescriptions,
    gateIllustrations,
  });

  const { solos, decks } = createSolos({
    gateData,
    duelDataList,
    duelDescriptions,
  });

  await saveFiles({ gatePath, soloPath, deckPath, gates, solos, decks });
};

const loadGateData = async (dataPath: string): Promise<GateData> => {
  const rawData = await readJson<GateDataFile>(
    path.resolve(dataPath, 'Solo.json'),
  );

  return rawData.Master.Solo;
};

const loadDuelDataList = async (dataPath: string): Promise<DuelData[]> => {
  const soloPaths = await glob(path.resolve(dataPath, 'SoloDuels/*.json'));
  const rawData = await batchPromiseAll(soloPaths.map(readJson<DuelDataFile>));

  return rawData.map((data) => data.Duel);
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
}): Gate[] => {
  const { gateData, gateNames, gateDescriptions, gateIllustrations } = data;

  return Object.keys(gateData.gate).map((gateKey) => {
    const gateId = Number(gateKey);

    return {
      id: gateId,
      name: gateNames.get(gateId) || '',
      description: gateDescriptions.get(gateId) || '',
      illust_id: gateIllustrations.get(gateId)?.illust_id || 4027, // Exodia
      illust_x: gateIllustrations.get(gateId)?.illust_x || 0,
      illust_y: gateIllustrations.get(gateId)?.illust_y || 0,
      priority: gateData.gate[gateId].priority,
      parent_id: gateData.gate[gateId].parent_gate,
      solos: createSolosInGate(gateData, gateId),
    };
  });
};

const createSolosInGate = (
  gateData: GateData,
  gateId: number,
): SoloInGate[] => {
  const { chapter, unlock, unlock_item } = gateData;

  return Object.entries(chapter[gateId]).map(([soloKey, value]) => {
    const { unlock_id, parent_chapter } = value;
    const soloId = Number(soloKey);
    const results: SoloInGate = { id: soloId, parent_id: parent_chapter };

    if (unlock_id) {
      const unlockItemIds = unlock[unlock_id][DataUnlockType.ITEM];

      results.unlock = unlockItemIds?.flatMap((id) => {
        const unlockConsumItems = unlock_item[id][DataItemCategory.CONSUME];
        if (!unlockConsumItems) return [];

        return Object.entries(unlockConsumItems).map(
          ([itemId, counts]) =>
            ({
              category: OrbCodeToString[itemId as keyof typeof OrbCodeToString],
              value: counts,
            }) satisfies Unlock,
        );
      });
    }

    return results;
  });
};

const createSolos = (data: {
  gateData: GateData;
  duelDataList: DuelData[];
  duelDescriptions: Map<number, string>;
}): { solos: Solo[]; decks: DeckData[] } => {
  const { gateData, duelDataList, duelDescriptions } = data;

  const chapterMap = new Map(
    Object.values(gateData.chapter).flatMap((chapters) =>
      Object.entries(chapters).map(([id, chapter]) => [Number(id), chapter]),
    ),
  );

  const decks: DeckData[] = [];

  const solos: Solo[] = duelDataList
    .map((duelData): Solo | undefined => {
      const chapter = chapterMap.get(duelData.chapter);
      if (!chapter) return;

      const description = duelDescriptions.get(duelData.chapter) || '';

      const cpuDeckName = chapter.mydeck_set_id.toString();
      const myDeckReward = createReward(gateData, chapter.mydeck_set_id);
      const cpuDeck = createDeck(duelData.Deck[1], cpuDeckName);
      decks.push(cpuDeck);

      const rentalDeckName = chapter.set_id
        ? chapter.set_id.toString()
        : undefined;
      const rentalDeckReward = chapter.set_id
        ? createReward(gateData, chapter.set_id)
        : undefined;
      const rentalDeck = rentalDeckName
        ? createDeck(duelData.Deck[0], rentalDeckName)
        : undefined;
      if (rentalDeck) decks.push(rentalDeck);

      return {
        id: duelData.chapter,
        description,
        cpu_deck: `${cpuDeckName}.json`,
        rental_deck: rentalDeckName && `${rentalDeckName}.json`,
        mydeck_reward: myDeckReward,
        rental_reward: rentalDeckReward,
        cpu_hand: duelData.hnum?.[1] ?? 5,
        player_hand: duelData.hnum?.[0] ?? 5,
        cpu_name: duelData.name[1],
        cpu_flag: duelData.cpuflag ?? 'None',
        cpu_value: duelData.cpu ?? 98,
      };
    })
    .filter((solo): solo is Solo => Boolean(solo));

  return { solos, decks };
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
  const results: Reward[] = [];
  const rewardMap = gateData.reward[rewardId];

  const cardRewards = rewardMap[DataItemCategory.CARD];
  const structureRewards = rewardMap[DataItemCategory.STRUCTURE];
  const consumeRewards = rewardMap[DataItemCategory.CONSUME];

  if (cardRewards) {
    Object.entries(cardRewards).forEach(([cardId, counts]) => {
      Array.from({ length: counts }).forEach(() => {
        results.push({ category: 'CARD', value: Number(cardId) });
      });
    });
  }

  if (structureRewards) {
    Object.entries(structureRewards).forEach(([deckId, counts]) => {
      Array.from({ length: counts }).forEach(() => {
        results.push({ category: 'STRUCTURE', value: Number(deckId) });
      });
    });
  }

  if (consumeRewards) {
    Object.entries(consumeRewards).forEach(([itemId, counts]) => {
      if (itemId === DataConsumItemValue.Gem) {
        return results.push({ category: 'GEM', value: counts });
      }

      const orb = OrbCodeToString[itemId as keyof typeof OrbCodeToString];
      if (orb) {
        return results.push({ category: orb, value: counts });
      }
    });
  }

  return results;
};

const saveFiles = async (data: {
  gatePath: string;
  soloPath: string;
  deckPath: string;
  gates: Gate[];
  solos: Solo[];
  decks: DeckData[];
}) => {
  const { gatePath, soloPath, deckPath, gates, solos, decks } = data;
  log.info('Start save files');

  await backupFiles(await glob(path.resolve(gatePath, '**/*.json')), gatePath);
  await backupFiles(await glob(path.resolve(soloPath, '**/*.json')), soloPath);
  await backupFiles(await glob(path.resolve(deckPath, '**/*.json')), deckPath);
  log.info('Copied original files to backup folder');

  await batchPromiseAll(
    gates.map((gate) =>
      saveJson(path.resolve(gatePath, `${gate.name}.json`), gate),
    ),
  );
  log.info('Created gate files');

  await batchPromiseAll(
    solos.map((solo) =>
      saveJson(path.resolve(soloPath, `${solo.id}.json`), solo),
    ),
  );
  log.info('Created solo files');

  await batchPromiseAll(
    decks.map((deck) =>
      saveJson(path.resolve(deckPath, `${deck.name}.json`), deck),
    ),
  );
  log.info('Created deck files');
};
