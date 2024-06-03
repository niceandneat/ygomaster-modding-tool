import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { ItemCategory } from '../../../common/type';
import { ChapterDetailView } from './ChapterDetailView';

const meta = {
  title: 'Components/Chapter/ChapterDetailView',
  component: ChapterDetailView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onChange: fn(),
  },
} satisfies Meta<typeof ChapterDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: {},
};

export const Edit: Story = {
  args: {
    chapter: {
      id: 1,
      parent_id: 0,
      description: 'description',
      type: 'Duel',
      cpu_deck: 'cpu_deck.json',
      rental_deck: 'rental_deck.json',
      mydeck_reward: [{ category: ItemCategory.CONSUME, id: '1', counts: 100 }],
      rental_reward: [{ category: ItemCategory.CONSUME, id: '1', counts: 200 }],
      cpu_hand: 5,
      player_hand: 5,
      cpu_life: 8000,
      player_life: 8000,
      cpu_name: 'name',
      cpu_flag: 'None',
      cpu_value: 98,
    },
  },
};
