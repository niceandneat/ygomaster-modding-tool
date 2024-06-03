import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { useCallback } from 'react';

import { ComboboxInput } from './ComboboxInput';

const meta = {
  title: 'Components/Input/ComboboxInput',
  component: ComboboxInput,
  tags: ['autodocs'],
  args: {
    onChange: fn(),
  },
  argTypes: {
    value: {
      control: {
        type: 'object',
      },
    },
  },
} satisfies Meta<typeof ComboboxInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    value: 'Apple',
    label: 'label',
    options: [
      'Apple',
      'Banana',
      'Cherry',
      'Durian',
      'Fig',
      'Grape',
      'Honeydew Melon',
      'Imbe',
      'Jackfruit',
      'Kiwi',
      'Lemon',
      'Mango',
      'Nectarine',
      'Orange',
      'Peach',
      'Quince',
      'Rambutan',
      'Strawberry',
      'Tangerine',
      'Ugni',
      'Vanilla Bean',
      'Watermelon',
      'Xigua',
      'Yangmei',
      'Zucchini',
    ],
  },
  render: function Render(args) {
    const [{ onChange }, updateArgs] = useArgs<typeof args>();

    const handleChange = useCallback(
      (value: unknown) => {
        updateArgs({ value });
        onChange(value);
      },
      [updateArgs, onChange],
    );

    return <ComboboxInput {...args} onChange={handleChange} />;
  },
};

interface Value {
  id: string;
  name: string;
}

export const Object: Story = {
  args: {
    value: { id: 'A', name: 'Apple' },
    label: 'label',
    options: [
      { id: 'A', name: 'Apple' },
      { id: 'B', name: 'Banana' },
      { id: 'C', name: 'Cherry' },
      { id: 'D', name: 'Durian' },
      { id: 'F', name: 'Fig' },
      { id: 'G', name: 'Grape' },
      { id: 'H', name: 'Honeydew Melon' },
      { id: 'I', name: 'Imbe' },
      { id: 'J', name: 'Jackfruit' },
      { id: 'K', name: 'Kiwi' },
      { id: 'L', name: 'Lemon' },
      { id: 'M', name: 'Mango' },
      { id: 'N', name: 'Nectarine' },
      { id: 'O', name: 'Orange' },
      { id: 'P', name: 'Peach' },
      { id: 'Q', name: 'Quince' },
      { id: 'R', name: 'Rambutan' },
      { id: 'S', name: 'Strawberry' },
      { id: 'T', name: 'Tangerine' },
      { id: 'U', name: 'Ugni' },
      { id: 'V', name: 'Vanilla Bean' },
      { id: 'W', name: 'Watermelon' },
      { id: 'X', name: 'Xigua' },
      { id: 'Y', name: 'Yangmei' },
      { id: 'Z', name: 'Zucchini' },
    ],
    valueToString: (value) => (value as Value).name,
    fuseOptions: { keys: ['name'] },
  },
  render: function Render(args) {
    const [{ onChange }, updateArgs] = useArgs<typeof args>();

    const handleChange = useCallback(
      (value: unknown) => {
        updateArgs({ value });
        onChange(value);
      },
      [updateArgs, onChange],
    );

    return <ComboboxInput {...args} onChange={handleChange} />;
  },
};
