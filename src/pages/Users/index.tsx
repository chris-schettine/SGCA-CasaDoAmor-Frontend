import Button from '@mui/material/Button';
import { Link } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";
import TableUsers from "../../components/Table/TableUsers";
import PageHeader from "../../components/PageHeader";
import PageContainer from "../../components/PageContainer";
import Breadcrumbs from "../../components/Breadcrumbs";
import { FormControl, Input, InputAdornment, InputLabel, IconButton, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Suspense, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { AnimatedPage } from "../../components/AnimatedPage";
import { TableSkeleton } from "../../components/SuspenseWrapper";

const UsersContent = () => {
  const { canManageUsers } = usePermissions();
  const [searchText, setSearchText] = useState('');
  const theme = useTheme();

  const searchComponent = (
    <FormControl
      fullWidth
      variant="standard"
      sx={{
        color: theme.palette.text.primary,
        '& .MuiInputBase-input': {
          color: theme.palette.text.primary,
          WebkitTextFillColor: theme.palette.text.primary,
          opacity: 1,
        },
        '& .MuiInputLabel-root': {
          color: theme.palette.text.primary,
          WebkitTextFillColor: theme.palette.text.primary,
          opacity: 1,
        },
      }}
    >
      <InputLabel
        htmlFor="search"
        sx={{
          color: theme.palette.text.primary,
          WebkitTextFillColor: theme.palette.text.primary,
          opacity: 1,
          '&.Mui-focused': { color: theme.palette.text.primary },
        }}
      >
        Buscar Usuário
      </InputLabel>
      <Input
        id="search"
        type="search"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Digite os dados para pesquisa"
        sx={{
          color: theme.palette.text.primary,
          WebkitTextFillColor: theme.palette.text.primary,
          '&::placeholder': {
            color: theme.palette.text.primary,
            opacity: 1,
          },
          '& .MuiInputBase-input': {
            color: theme.palette.text.primary,
            WebkitTextFillColor: theme.palette.text.primary,
            '&::placeholder': {
              color: theme.palette.text.primary,
              opacity: 1,
            },
          },
          '& .MuiInputAdornment-root svg': {
            color: theme.palette.text.primary,
            opacity: 1,
          },
        }}
        endAdornment={
          <InputAdornment position="end">
            <IconButton aria-label="buscar" sx={{ color: theme.palette.text.primary, opacity: 1 }}>
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
      />
    </FormControl>
  );

  const actionButton = canManageUsers ? (
    <Button
      component={Link}
      to="/user/register"
      variant="contained"
      sx={{
        width: { xs: '100%', sm: 'auto' },
        // Explicit high-contrast for storybook / tests: primary background +
        // contrast text ensures the link/button text is readable against the
        // blue background used in the app theme.
        backgroundColor: `${theme.palette.primary.main} !important`,
        color: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
        WebkitTextFillColor: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
        opacity: 1,
        '&:hover': { backgroundColor: `${theme.palette.primary.dark} !important` },
        '&:focus-visible': { outline: `3px solid ${theme.palette.primary.light}`, outlineOffset: '2px' }
      }}
    >
      <span style={{ color: theme.palette.getContrastText(theme.palette.primary.main), WebkitTextFillColor: theme.palette.getContrastText(theme.palette.primary.main), fontWeight: 600, opacity: 1 }}>Adicionar</span>
    </Button>
  ) : undefined;

    return (
        <Box sx={{
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          minHeight: '100vh',
          p: 3,
          // Ensure any contained buttons in this page always have high-contrast
          // foreground against their background. Some children can inherit
          // parent color with high specificity; use !important here to override.
          '& .MuiButton-contained': {
            color: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
            backgroundColor: `${theme.palette.primary.main} !important`,
          }
        }}>
        <AnimatedPage>
          <PageContainer>
            <Breadcrumbs items={[{ label: 'Usuários Autorizados' }]} />
            
            <PageHeader 
              title="Usuários Autorizados"
              subtitle="Gestão de usuários com acesso ao sistema"
              searchComponent={searchComponent}
              action={actionButton}
            />
            <Suspense fallback={<TableSkeleton rows={10} />}>
              <TableUsers searchText={searchText} />
            </Suspense>
          </PageContainer>
        </AnimatedPage>
      </Box>
  );
};

export default UsersContent;
