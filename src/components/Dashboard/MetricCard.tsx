import { Box, Card, CardContent, Typography, alpha, useTheme } from '@mui/material';
import { type ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  formatValue?: (value: number | string) => string;
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  formatValue,
}: MetricCardProps) => {
  const theme = useTheme();

  const colorMap = {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main,
  };

  const bgColorMap = {
    primary: alpha(theme.palette.primary.main, 0.1),
    secondary: alpha(theme.palette.secondary.main, 0.1),
    success: alpha(theme.palette.success.main, 0.1),
    warning: alpha(theme.palette.warning.main, 0.1),
    error: alpha(theme.palette.error.main, 0.1),
    info: alpha(theme.palette.info.main, 0.1),
  };

  const displayValue = formatValue && typeof value === 'number' ? formatValue(value) : value;

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: bgColorMap[color],
                color: colorMap[color],
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 700, color: colorMap[color], mb: subtitle ? 1 : 0 }}>
          {displayValue}
        </Typography>

        {subtitle && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
