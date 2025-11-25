import type { Meta, StoryObj } from '@storybook/react';
import {
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Typography,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  AnimatedList,
  AnimatedListItem,
  AnimatedTableRow,
  AnimatedCard,
  AnimatedTable,
} from './index';

const meta: Meta<typeof AnimatedList> = {
  title: 'Components/Utils/AnimatedList',
  component: AnimatedList,
  tags: ['a11y-fix'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;

type Story = StoryObj<typeof AnimatedList>;

export const DefaultList: Story = {
  render: () => {
    const theme = useTheme();
    // Diagnostic: print computed colors/ancestry for list spans so we can
    // find duplicates or clones that axe might evaluate. Run this before
    // returning the JSX to avoid syntax-time issues.
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const nodes = Array.from(document.querySelectorAll('li[role="listitem"] span')) as HTMLElement[];
        nodes.forEach((n, idx) => {
          try {
            const cs = window.getComputedStyle(n);
            // eslint-disable-next-line no-console
            console.log('DEBUG_ANIM_LIST: list-span[' + idx + ']', n.textContent?.slice(0, 40), 'color:', cs.getPropertyValue('color'), 'opacity:', cs.getPropertyValue('opacity'));
          } catch (e) {}
        });
      }, 0);
    }
    return (
    <Paper elevation={1} sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.primary }}>
      <List component="div" aria-label="Lista animada">
        <AnimatedList>
          {['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'].map(
            (text, index) => (
              <AnimatedListItem key={index}>
                <ListItem component="div">
                  <ListItemText primary={<span style={{ color: 'inherit' }}>{text}</span>} />
                </ListItem>
              </AnimatedListItem>
            )
          )}
        </AnimatedList>
      </List>
    </Paper>
    );
  },
  name: 'Animated List',
};

export const TableAnimation: StoryObj<typeof AnimatedTableRow> = {
  render: () => {
    const theme = useTheme();
    return (
    <Paper elevation={1} sx={{ bgcolor: theme.palette.background.paper, color: theme.palette.text.primary }}>
      <AnimatedTable aria-label="Tabela animada">
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
                  <TableCell>
                    <span style={{ color: 'inherit', WebkitTextFillColor: 'inherit', opacity: 1, filter: 'none', mixBlendMode: 'normal' }}>{row.id}</span>
                  </TableCell>
                  <TableCell>
                    <span style={{ color: 'inherit', WebkitTextFillColor: 'inherit', opacity: 1, filter: 'none', mixBlendMode: 'normal' }}>{row.name}</span>
                  </TableCell>
                  <TableCell>
                    <span style={{ color: 'inherit', WebkitTextFillColor: 'inherit', opacity: 1, filter: 'none', mixBlendMode: 'normal' }}>{row.email}</span>
                  </TableCell>
            </AnimatedTableRow>
          ))}
        </TableBody>
      </AnimatedTable>
    </Paper>
    );
  },
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
