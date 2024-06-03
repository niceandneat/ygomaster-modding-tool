import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { GateDetailView } from './GateDetailView';

const meta = {
  title: 'Components/Gate/GateDetailView',
  component: GateDetailView,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onSubmit: fn(),
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
      description: 'description',
      illust_id: 4027,
      illust_x: 0.03,
      illust_y: 0,
      priority: 123,
      chapters: [],
    },
  },
};
