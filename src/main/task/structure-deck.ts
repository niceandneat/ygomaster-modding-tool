import path from 'node:path';

export const isCustomStructureDeckId = (id: number) => id > 1121000;

export const isCustomStructureDeckPath = (name: string) =>
  isCustomStructureDeckId(Number(path.basename(name).split('.')[0]));
