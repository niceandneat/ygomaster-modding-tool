import type { Meta, StoryObj } from '@storybook/react';

import { SoloDetailView } from './SoloDetailView';

const meta = {
  title: 'Components/SoloDetailView',
  component: SoloDetailView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SoloDetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {
  args: {
    title: 'Title',
  },
};

export const Edit: Story = {
  args: {
    title: 'Title',
    solo: {
      id: 1,
      description: 'description',
      cpu_deck: 'cpu_deck.json',
      rental_deck: 'rental_deck.json',
      mydeck_reward: [{ category: 'GEM', value: 100 }],
      rental_reward: [{ category: 'DARK_ORB', value: 200 }],
      cpu_hand: 6,
      player_hand: 5,
      cpu_name: 'name',
      cpu_flag: 'None',
      cpu_value: 98,
    },
  },
};
