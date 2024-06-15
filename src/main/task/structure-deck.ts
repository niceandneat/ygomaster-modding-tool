import path from 'node:path';

export const isCustomStructureDeck = (name: string) =>
  Number(path.basename(name).split('.')[0]) > 1121000;
