import {
  Tag,
  Text,
  Tooltip,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { memo } from 'react';
import { useWatch } from 'react-hook-form';

import {
  Chapter,
  Gate,
  Item,
  isDuelChapter,
  isRewardChapter,
  isUnlockChapter,
} from '../../../common/type';
import { dataStore } from '../../data';
import { ItemImage } from '../common/ItemImage';

const useStyles = makeStyles({
  title: {
    display: 'block',
    marginBottom: tokens.spacingVerticalS,
  },
});

const useItemStyles = makeStyles({
  container: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  icon: {
    height: '24px',
  },
});

const getTotalItems = (items: Item[]) => {
  const results: Item[] = [];

  items.forEach((item) => {
    const existing = results.find(
      (seen) => seen.category === item.category && seen.id === item.id,
    );

    if (existing) {
      existing.counts += item.counts;
    } else {
      results.push({ ...item });
    }
  });

  return results.sort((a, b) => {
    if (a.category !== b.category) return a.category - b.category;
    if (a.id !== b.id) return a.id - b.id;
    return 0;
  });
};

const getTotalRewardsAndUnlocks = (chapters: Chapter[]) => {
  const rewards: Item[] = [];
  const unlocks: Item[] = [];

  chapters.forEach((chapter) => {
    if (isDuelChapter(chapter)) {
      chapter.mydeck_reward && rewards.push(...chapter.mydeck_reward);
      chapter.rental_reward && rewards.push(...chapter.rental_reward);
    } else if (isUnlockChapter(chapter)) {
      unlocks.push(...chapter.unlock);
    } else if (isRewardChapter(chapter)) {
      rewards.push(...chapter.reward);
    }
  });

  return { rewards: getTotalItems(rewards), unlocks: getTotalItems(unlocks) };
};

interface GateTotalItemsProps {
  items: Item[];
}

const GateTotalItems = ({ items }: GateTotalItemsProps) => {
  const classes = useItemStyles();

  return (
    <div className={classes.container}>
      {items.map(({ category, id, counts }, index) => {
        const name = String(dataStore.getItem(category, id)?.name ?? id);
        return (
          <Tooltip key={index} content={name} relationship="description">
            <Tag
              media={
                <ItemImage
                  thumbnail
                  alt={name}
                  className={classes.icon}
                  category={category}
                  item={id}
                />
              }
            >
              {counts}
            </Tag>
          </Tooltip>
        );
      })}
    </div>
  );
};

export const GateTotalRewardsAndUnlocks = memo(() => {
  const classes = useStyles();
  const chapters = useWatch<Gate, 'chapters'>({ name: 'chapters' });
  const { rewards, unlocks } = getTotalRewardsAndUnlocks(chapters);

  return (
    <>
      {rewards.length ? (
        <div>
          <Text className={classes.title}>total rewards</Text>
          <GateTotalItems items={rewards} />
        </div>
      ) : null}
      {unlocks.length ? (
        <div>
          <Text className={classes.title}>total unlocks</Text>
          <GateTotalItems items={unlocks} />
        </div>
      ) : null}
    </>
  );
});

GateTotalRewardsAndUnlocks.displayName = 'GateTotalRewardsAndUnlocks';
