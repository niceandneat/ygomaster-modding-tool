const fs = require('fs/promises');

// out.json from https://github.com/JSY1728/EDOPRO-Korean-CDB-TEST

const main = async () => {
  // read Ydk-to-id map
  const textFile = await fs.readFile('./YdkIds.txt', { encoding: 'utf-8' });
  const lines = textFile.split('\n');
  const ydkToId = new Map(lines.map((line) => line.split(' ').map(Number)));

  const jsonFile = await fs.readFile('./input.json', { encoding: 'utf-8' });
  const data = JSON.parse(jsonFile)
    .map((d) => ({ ...d, id: ydkToId.get(d.id)?.toString() }))
    .filter(({ id }) => Boolean(id))
    .reduce((res, d) => {
      if (!res[d.id]) res[d.id] = d;
      return res;
    }, {});

  await fs.writeFile(
    './output.json',
    JSON.stringify(Object.values(data), null, 2),
  );
};

main();
