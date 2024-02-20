import type { Meta, StoryObj } from '@storybook/react';

import { GateDetailView } from './GateDetailView';

const meta = {
  title: 'Components/GateDetailView',
  component: GateDetailView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GateDetailView>;

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
    gate: {
      id: 123,
      parent_id: 0,
      name: 'name',
      description: 'decription',
      illust_id: 4027,
      illust_x: 0.03,
      illust_y: 0,
      priority: 123,
      solos: [
        {
          id: 1,
          parent_id: 0,
        },
        {
          id: 2,
          parent_id: 1,
          unlock: [{ category: 'DARK_ORB', value: 100 }],
        },
        {
          id: 3,
          parent_id: 2,
          unlock: [
            { category: 'FIRE_ORB', value: 100 },
            { category: 'WARTER_ORB', value: 200 },
          ],
        },
      ],
    },
  },
};
