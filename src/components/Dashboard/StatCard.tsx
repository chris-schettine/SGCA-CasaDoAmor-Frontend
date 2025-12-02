import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';

interface StatCardProps {
  label: string;
  value: number | string;
  percentage?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export const StatCard = ({ label, value, percentage, trend }: StatCardProps) => {
  const theme = useTheme();

  const trendColor = trend === 'up' 
    ? theme.palette.success.main 
    : trend === 'down' 
    ? theme.palette.error.main 
    : theme.palette.text.secondary;

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
            {value}
          </Typography>
          {percentage !== undefined && (
            <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600 }}>
              {percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
