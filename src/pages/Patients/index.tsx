import React, { Suspense, useState } from "react";
import { Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { pacienteService } from '../../api/paciente.service';
import { TableSkeleton } from '../../components/SuspenseWrapper';
import PageHeader from "../../components/PageHeader";
import PageContainer from "../../components/PageContainer";
import { AnimatedPage } from "../../components/AnimatedPage";
import SearchBar from "../../components/SearchBar";
import { useTheme } from "@mui/material/styles";

const LazyTablePatients = React.lazy(() => import('../../components/Table/TablePatients'));

const Patients = () => {
  const [searchText, setSearchText] = useState('');
  const [exporting, setExporting] = useState(false);
  const theme = useTheme();

  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Corrigido: chamando listarPacientes com (limit, offset, searchText)
      const response = await pacienteService.listarPacientes(10000, 0, searchText);

      const data = response.nodes || [];

      if (!data || data.length === 0) {
        setExporting(false);
        return;
      }

      const headers = ['ID', 'Nome', 'CPF', 'RG', 'Email', 'Telefone', 'Nascimento'];

      const rows = data.map((p: any) => [
        p.id,
        p.dadoPessoal?.nome || '',
        p.dadoPessoal?.cpf || '',
        p.dadoPessoal?.rg || '',
        p.email || '',
        p.dadoPessoal?.telefone || '',
        p.dadoPessoal?.dataNascimento ? new Date(p.dadoPessoal.dataNascimento).toLocaleDateString('pt-BR') : ''
      ]);

      const escapeCell = (cell: unknown) => {
        if (cell === null || cell === undefined) return '';
        const str = String(cell);
        return `"${str.replace(/"/g, '""')}"`;
      };

      const csvContent = [headers, ...rows]
        .map((r) => r.map(escapeCell).join(','))
        .join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `pacientes_${today}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setExporting(false);
    }
  };

  const searchComponent = (
    <SearchBar
      value={searchText}
      onChange={setSearchText}
      label="Buscar Paciente"
      placeholder="Digite o nome, CPF ou RG do paciente"
    />
  );

  const actionButton = (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        variant="outlined"
        startIcon={<FileDownloadIcon />}
        onClick={handleExport}
        disabled={exporting}
        sx={{
          color: theme.palette.text.primary,
          borderColor: theme.palette.text.primary,
          '&:hover': { borderColor: theme.palette.text.primary, backgroundColor: theme.palette.action.hover },
        }}
      >
        {exporting ? 'Exportando...' : 'Exportar'}
      </Button>
      <Button
        component={Link}
        to="/patient/register"
        variant="contained"
        sx={{
          backgroundColor: `${theme.palette.primary.main} !important`,
          color: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
          WebkitTextFillColor: `${theme.palette.getContrastText(theme.palette.primary.main)} !important`,
          fontWeight: 600,
          '&:hover': { backgroundColor: `${theme.palette.primary.dark} !important` },
        }}
      >
        Adicionar
      </Button>
    </Box>
  );

  return (
    <AnimatedPage>
      <PageContainer>
        <PageHeader 
          title="Pacientes"
          searchComponent={searchComponent}
          action={actionButton}
        />
        <Suspense fallback={<TableSkeleton rows={10} />}>
          <LazyTablePatients searchText={searchText} />
        </Suspense>
      </PageContainer>
    </AnimatedPage>
  );
};

export default Patients;
