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
    loadChapters: async () => [
      { id: 1, name: 'chapter-1' },
      { id: 2, name: 'chapter-2' },
      { id: 3, name: 'chapter-3' },
      { id: 4, name: 'chapter-4' },
      { id: 5, name: 'chapter-5' },
    ],
    gates: [
      { id: 1, parent_id: 0, name: 'gate-1', path: '1.json', priority: 1 },
      { id: 2, parent_id: 0, name: 'gate-2', path: '2.json', priority: 2 },
      { id: 3, parent_id: 0, name: 'gate-3', path: '3.json', priority: 3 },
      { id: 4, parent_id: 0, name: 'gate-4', path: '4.json', priority: 4 },
      { id: 5, parent_id: 0, name: 'gate-5', path: '5.json', priority: 5 },
    ],
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
      id: 1,
      parent_id: 0,
      name: 'name-1',
      description: 'description',
      illust_id: 4027,
      illust_x: 0.03,
      illust_y: 0,
      priority: 123,
      clear_chapter: { gateId: 123, chapterId: 0 },
      unlock: [],
      chapters: [],
    },
  },
};
