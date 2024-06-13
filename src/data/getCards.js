// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs/promises');

// korean.json from https://github.com/JSY1728/EDOPRO-Korean-CDB-TEST
// english.json from https://github.com/ProjectIgnis/BabelCDB

const getLanguageCardMap = async (filePath) => {
  const json = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(json);
  const map = new Map(data.map((data) => [data.id, data]));

  return map;
};

const cardToData = (card) => {
  if (!card) return;

  return {
    name: card.name,
    // desc: card.desc,
  };
};

const main = async () => {
  // read Ydk-to-id map
  const textFile = await fs.readFile('./YdkIds.txt', 'utf-8');
  const lines = textFile.split('\n').filter(Boolean);
  const ydkAndIds = lines.map((line) => line.split(' ').map(Number));

  const englishMap = await getLanguageCardMap('./english.json');
  const koreanMap = await getLanguageCardMap('./korean.json');

  const data = ydkAndIds
    .map(([ydk, id]) => {
      const englishCard = englishMap.get(ydk);
      const koreanCard = koreanMap.get(ydk);

      return {
        id,
        english: cardToData(englishCard),
        korean: cardToData(koreanCard),
      };
    })
    .filter(({ id, english, korean }) => {
      const foundName = Boolean(english && korean);
      if (!foundName) console.log({ id, english, korean });
      return foundName;
    })
    .sort((a, b) => a.id - b.id);

  await fs.writeFile(
    './cards.json',
    JSON.stringify(Object.values(data), null, 2),
  );
};

main();
