import { Breadcrumbs as MuiBreadcrumbs, Typography, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  state?: Record<string, unknown>;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <MuiBreadcrumbs 
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 3 }}
    >
      {/* Sempre incluir Home como primeiro item */}
      <MuiLink
        component={Link}
        to="/"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          color: 'text.primary',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
            color: 'primary.main',
          },
        }}
      >
        <HomeIcon fontSize="small" />
        Início
      </MuiLink>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        if (isLast || !item.path) {
          // Último item ou item sem link - apenas texto
          return (
            <Typography 
              key={index} 
              color="text.primary"
              sx={{ 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {item.label}
            </Typography>
          );
        }

        // Itens intermediários com link
        return (
          <MuiLink
            key={index}
            component={Link}
            to={item.path}
            state={item.state}
            sx={{
              color: 'text.primary',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
                color: 'primary.main',
              },
            }}
          >
            {item.label}
          </MuiLink>
        );
      })}
    </MuiBreadcrumbs>
  );
}
