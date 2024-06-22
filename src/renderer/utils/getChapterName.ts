import {
  Chapter,
  isDuelChapter,
  isRewardChapter,
  isUnlockChapter,
} from '../../common/type';

export const getChapterName = (chapter: Chapter) => {
  if (isUnlockChapter(chapter)) {
    return `[Unlock] ${chapter.description?.replaceAll('\n', '') ?? chapter.id}`;
  }

  if (isRewardChapter(chapter)) {
    return `[Reward] ${chapter.description?.replaceAll('\n', '') ?? chapter.id}`;
  }

  if (isDuelChapter(chapter)) {
    return `[Duel] ${chapter.cpu_deck.replace(/\.json$/, '')}`;
  }

  return '';
};
