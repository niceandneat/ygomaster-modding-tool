import {
  Chapter,
  isDuelChapter,
  isRewardChapter,
  isUnlockChapter,
} from '../../common/type';

export const getChapterName = (chapter: Chapter) => {
  if (isUnlockChapter(chapter)) {
    return `[Unlock] ${chapter.description?.split('/n')[0] ?? chapter.id}`;
  }

  if (isRewardChapter(chapter)) {
    return `[Reward] ${chapter.description?.split('/n')[0] ?? chapter.id}`;
  }

  if (isDuelChapter(chapter)) {
    return `[Duel] ${chapter.description?.split('/n')[0] ?? chapter.id} (${chapter.cpu_deck.replace(/\.json$/, '')})`;
  }

  return '';
};
