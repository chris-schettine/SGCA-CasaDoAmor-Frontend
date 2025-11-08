import type { Meta, StoryObj } from '@storybook/react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StandardTable, { type Column, type Action } from './index';

type PatientRow = {
  id: string;
  name: string;
  email: string;
  status: 'Ativo' | 'Inativo';
};

const columns: Column<PatientRow>[] = [
  { id: 'name', label: 'Nome', minWidth: 160 },
  { id: 'email', label: 'E-mail', minWidth: 200 },
  { id: 'status', label: 'Status', minWidth: 100 },
];

const actions: Action<PatientRow>[] = [
  {
    icon: <VisibilityIcon fontSize="small" />,
    tooltip: 'Visualizar',
    onClick: (row) => alert(`Visualizar ${row.name}`),
  },
  {
    icon: <EditIcon fontSize="small" />,
    tooltip: 'Editar',
    color: 'secondary',
    onClick: (row) => alert(`Editar ${row.name}`),
  },
  {
    icon: <DeleteIcon fontSize="small" />,
    tooltip: 'Remover',
    color: 'error',
    onClick: (row) => alert(`Remover ${row.name}`),
  },
];

const data: PatientRow[] = Array.from({ length: 18 }).map((_, index) => ({
  id: `patient-${index + 1}`,
  name: `Paciente ${index + 1}`,
  email: `paciente${index + 1}@example.com`,
  status: index % 2 === 0 ? 'Ativo' : 'Inativo',
}));

const PatientStandardTable = (props: any) => <StandardTable<PatientRow> {...props} />;

const meta: Meta<typeof PatientStandardTable> = {
  title: 'Components/Tables/StandardTable',
  component: PatientStandardTable,
  args: {
    columns,
    data,
    actions,
    getRowId: (row: PatientRow) => row.id,
  },
};

export default meta;

type Story = StoryObj<typeof PatientStandardTable>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
  },
};
