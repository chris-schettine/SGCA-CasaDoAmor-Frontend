import React, { useState } from "react";
import { Button, Box } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TableCompanions from "../../components/Table/TableCompanions";
import PageHeader from "../../components/PageHeader";
import PageContainer from "../../components/PageContainer";
import { AnimatedPage } from "../../components/AnimatedPage";
import SearchBar from "../../components/SearchBar";
import { acompanhanteService } from '../../api/acompanhante.service';

const Companions = () => {
  const [searchText, setSearchText] = useState('');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);

      // Busca todos os acompanhantes (limite alto para pegar tudo)
      const response = await acompanhanteService.listarAcompanhantes(10000, 0, searchText);
      
      // Garante que 'nodes' existe
      const data = response.nodes || [];

      if (!data || data.length === 0) {
        setExporting(false);
        return;
      }

      const headers = ['Nome', 'CPF', 'RG', 'Telefone', 'Email', 'Grau de Parentesco'];

      const rows = data.map((item: any) => {
        // Tenta pegar direto do item, ou de dadoPessoal se existir
        const nome = item.nome || item.dadoPessoal?.nome || '';
        const cpf = item.cpf || item.dadoPessoal?.cpf || '';
        const rg = item.rg || item.dadoPessoal?.rg || '';
        const telefone = item.telefone || item.dadoPessoal?.telefone || '';
        const email = item.email || '';
        
        // CORREÇÃO AQUI: O nome no DTO é 'parentesco', não 'grauParentesco'
        const parentesco = item.parentesco || ''; 

        return [nome, cpf, rg, telefone, email, parentesco];
      });

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
      a.download = `acompanhantes_${today}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Erro ao exportar acompanhantes:", error);
    } finally {
      setExporting(false);
    }
  };

  const searchComponent = (
    <SearchBar
      value={searchText}
      onChange={setSearchText}
      label="Buscar Acompanhante"
      placeholder="Digite o nome, CPF ou RG do acompanhante"
    />
  );

  // Botão de Exportar no Header
  const actionButton = (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Button
        variant="outlined"
        startIcon={<FileDownloadIcon />}
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? 'Exportando...' : 'Exportar'}
      </Button>
    </Box>
  );

  return (
    <AnimatedPage>
      <PageContainer>
        <PageHeader 
          title="Acompanhantes"
          searchComponent={searchComponent}
          action={actionButton}
        />
        <TableCompanions searchText={searchText} />
      </PageContainer>
    </AnimatedPage>
  );
};

export default Companions;