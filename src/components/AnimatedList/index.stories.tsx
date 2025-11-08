import type { Meta, StoryObj } from '@storybook/react';
import {
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  AnimatedList,
  AnimatedListItem,
  AnimatedTableRow,
  AnimatedCard,
} from './index';

const meta: Meta<typeof AnimatedList> = {
  title: 'Components/Utils/AnimatedList',
  component: AnimatedList,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AnimatedList>;

export const DefaultList: Story = {
  render: () => (
    <Paper elevation={1}>
      <List>
        <AnimatedList>
          {['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'].map(
            (text, index) => (
              <AnimatedListItem key={index}>
                <ListItem>
                  <ListItemText primary={text} />
                </ListItem>
              </AnimatedListItem>
            )
          )}
        </AnimatedList>
      </List>
    </Paper>
  ),
  name: 'Animated List',
};

export const TableAnimation: StoryObj<typeof AnimatedTableRow> = {
  render: () => (
    <Paper elevation={1}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[
            { id: 1, name: 'John Doe', email: 'john.doe@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com' },
            { id: 3, name: 'Peter Jones', email: 'peter.jones@example.com' },
          ].map((row) => (
            <AnimatedTableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell>{row.email}</TableCell>
            </AnimatedTableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  ),
  name: 'Animated Table Row',
};

export const CardAnimation: StoryObj<typeof AnimatedCard> = {
  render: () => (
    <AnimatedCard>
      <Card>
        <CardContent>
          <Typography variant="h5" component="div">
            Animated Card
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            This is an animated card.
          </Typography>
          <Typography variant="body2">
            It appears with a subtle animation and has a hover effect.
          </Typography>
        </CardContent>
      </Card>
    </AnimatedCard>
  ),
  name: 'Animated Card',
};
