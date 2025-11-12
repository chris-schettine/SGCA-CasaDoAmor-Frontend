import type { Meta, StoryObj } from '@storybook/react';
import { VirtualizedTable, VirtualizedPatientTable } from '.';

const meta: Meta<typeof VirtualizedTable> = {
  title: 'Components/VirtualizedTable',
  component: VirtualizedTable,
};

export default meta;

const columns = [
  {
    field: 'id',
    headerName: 'ID',
    width: 90,
  },
  {
    field: 'firstName',
    headerName: 'First name',
    width: 150,
  },
  {
    field: 'lastName',
    headerName: 'Last name',
    width: 150,
  },
  {
    field: 'age',
    headerName: 'Age',
    width: 110,
  },
];

const rows = Array.from({ length: 1000 }, (_, index) => ({
  id: index + 1,
  lastName: `Snow ${index}`,
  firstName: `Jon ${index}`,
  age: 35,
}));

export const Default: StoryObj<typeof VirtualizedTable> = {
  args: {
    data: rows,
    columns,
  },
};

export const WithRowClick: StoryObj<typeof VirtualizedTable> = {
  args: {
    data: rows,
    columns,
    onRowClick: (row) => alert(`Clicked on row with id: ${row.id}`),
  },
};

export const PatientTable: StoryObj<typeof VirtualizedPatientTable> = {
  render: (args) => <VirtualizedPatientTable {...args} />,
  args: {
    data: rows,
    columns,
  },
};

export const PatientTableLoading: StoryObj<typeof VirtualizedPatientTable> = {
  render: (args) => <VirtualizedPatientTable {...args} />,
  args: {
    data: [],
    columns,
    isLoading: true,
  },
};

export const PatientTableEmpty: StoryObj<typeof VirtualizedPatientTable> = {
  render: (args) => <VirtualizedPatientTable {...args} />,
  args: {
    data: [],
    columns,
  },
};
