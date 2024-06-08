import { Chapter, isDuelChapter, isGateChapter } from '../../common/type';

export const getChapterName = (chapter: Chapter) => {
  if (isGateChapter(chapter)) {
    return `[Gate] ${chapter.description?.split('/n')[0] ?? chapter.id}`;
  }

  if (isDuelChapter(chapter)) {
    return `[Duel] ${chapter.description?.split('/n')[0] ?? chapter.id} (${chapter.cpu_deck.replace(/\.json$/, '')})`;
  }

  return '';
};
