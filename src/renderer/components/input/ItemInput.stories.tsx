import { useArgs } from '@storybook/preview-api';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback } from 'react';

import { Item, ItemCategory } from '../../../common/type';
import { ItemInput } from './ItemInput';

const meta = {
  title: 'Components/Input/ItemInput',
  component: ItemInput,
  tags: ['autodocs'],
} satisfies Meta<typeof ItemInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Base: Story = {
  args: {
    value: { category: ItemCategory.CONSUME, id: '1', counts: 100 },
  },
  render: function Render(args) {
    const [{ onChange }, updateArgs] = useArgs<typeof args>();

    const handleChange = useCallback(
      (value: Item) => {
        updateArgs({ value });
        onChange(value);
      },
      [updateArgs, onChange],
    );

    return <ItemInput {...args} onChange={handleChange} />;
  },
};
