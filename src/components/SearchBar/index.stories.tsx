import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import SearchBar from './index';

const meta: Meta<typeof SearchBar> = {
  title: 'Components/Inputs/SearchBar',
  component: SearchBar,
};

export default meta;

type Story = StoryObj<typeof SearchBar>;

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <SearchBar {...args} value={value} onChange={setValue} />;
  },
};
