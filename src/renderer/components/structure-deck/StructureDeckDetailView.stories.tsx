import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { withRouter } from 'storybook-addon-remix-react-router';

import { StructureDeckDetailView } from './StructureDeckDetailView';

const meta = {
  title: 'Components/StructureDeck/StructureDeckDetailView',
  component: StructureDeckDetailView,
  tags: ['autodocs'],
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onSubmit: fn(),
    structureDecks: [
      {
        id: 1121001,
        name: 'structure-deck-1',
        description: 'structure-deck-1',
        deck: '',
        focus: [0, 0, 0],
        box: 0,
        sleeve: 0,
      },
      {
        id: 1121002,
        name: 'structure-deck-2',
        description: 'structure-deck-2',
        deck: '',
        focus: [0, 0, 0],
        box: 0,
        sleeve: 0,
      },
      {
        id: 1121003,
        name: 'structure-deck-3',
        description: 'structure-deck-3',
        deck: '',
        focus: [0, 0, 0],
        box: 0,
        sleeve: 0,
      },
      {
        id: 1121004,
        name: 'structure-deck-4',
        description: 'structure-deck-4',
        deck: '',
        focus: [0, 0, 0],
        box: 0,
        sleeve: 0,
      },
      {
        id: 1121005,
        name: 'structure-deck-5',
        description: 'structure-deck-5',
        deck: '',
        focus: [0, 0, 0],
        box: 0,
        sleeve: 0,
      },
    ],
  },
} satisfies Meta<typeof StructureDeckDetailView>;

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
    structureDeck: {
      id: 1121006,
      name: 'structure-deck-1',
      description: 'structure-deck-1',
      deck: 'deck.json',
      focus: [0, 0, 0],
      box: 0,
      sleeve: 0,
    },
  },
};
