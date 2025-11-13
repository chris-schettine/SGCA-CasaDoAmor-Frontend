import { useState } from 'react';
import { Box, Typography, Stack, Button, CircularProgress, Alert, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import { ConsentPurposeToggle } from '../ConsentPurposeToggle/ConsentPurposeToggle';
import { CONSENT_PURPOSES, CONSENT_LABELS } from '../../config/consentConfig';
import type { ConsentChoice } from '../../types/consent.types';
import { ConsentColors } from '../../config/designTokens';

interface ConsentPreferencesPanelProps {
  currentChoices?: ConsentChoice;
  onSave: (choices: ConsentChoice) => void;
  isLoading?: boolean;
}

/**
 * Painel de gerenciamento de preferências de consentimento
 * 
 * Features:
 * - Lista todas as finalidades (essenciais + opcionais)
 * - Essenciais: Sempre ativados, toggle desabilitado
 * - Opcionais: Toggle funcional
 * - Botão Salvar: Disabled até haver mudanças
 * - Feedback visual de loading
 * 
 * @example
 * ```tsx
 * <ConsentPreferencesPanel
 *   currentChoices={choices}
 *   onSave={handleSave}
 *   isLoading={isSaving}
 * />
 * ```
 */
export function ConsentPreferencesPanel({
  currentChoices = {},
  onSave,
  isLoading = false,
}: ConsentPreferencesPanelProps) {
  const [localChoices, setLocalChoices] = useState<ConsentChoice>(() => {
    // Inicializar com currentChoices ou defaults
    const initial: ConsentChoice = {};
    CONSENT_PURPOSES.forEach((purpose) => {
      initial[purpose.id] = currentChoices[purpose.id] ?? purpose.defaultEnabled;
    });
    return initial;
  });

  const hasChanges = JSON.stringify(localChoices) !== JSON.stringify(currentChoices);

  const handleToggle = (purposeId: string, checked: boolean) => {
    setLocalChoices((prev) => ({
      ...prev,
      [purposeId]: checked,
    }));
  };

  const handleSave = () => {
    onSave(localChoices);
  };

  // Separar essenciais de opcionais
  const essentialPurposes = CONSENT_PURPOSES.filter((p) => p.category === 'essential');
  const optionalPurposes = CONSENT_PURPOSES.filter((p) => p.category !== 'essential');

  const [showFullTerms, setShowFullTerms] = useState(false);

  return (
    <Box>
      {/* Alerta informativo */}
      <Alert severity="info" sx={{ mb: 2.5, fontSize: '0.9rem' }}>
        <strong>Essenciais:</strong> Sempre ativos (necessários para funcionamento)
        <br />
        <strong>Opcionais:</strong> Você escolhe quais deseja permitir
      </Alert>

      {/* Link/Toggle: detalhes técnicos (posicionado consistentemente no topo do painel) */}
      <Button
        onClick={() => setShowFullTerms((s) => !s)}
        size="small"
        aria-expanded={showFullTerms}
        aria-controls="consent-technical-details-panel"
        endIcon={<ExpandMoreIcon sx={{ transform: showFullTerms ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />}
        sx={{
          mb: 1,
          textTransform: 'none',
          fontSize: '0.8125rem',
          color: ConsentColors.text.secondary,
          alignSelf: 'flex-start',
          display: 'inline-flex',
          ml: 0,
        }}
      >
        {showFullTerms ? 'Ocultar detalhes técnicos' : 'Ver detalhes técnicos'}
      </Button>

      <Collapse in={showFullTerms} id="consent-technical-details-panel">
        <Box
          sx={{
            mt: 1,
            mb: 2,
            p: 2,
            backgroundColor: ConsentColors.surface.default,
            borderRadius: 2,
            border: `1px solid ${ConsentColors.border.default}`,
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.6, color: ConsentColors.text.secondary }}>
            <strong>Responsável:</strong> Casa do Amor
            <br />
            <strong>Finalidades:</strong> Autenticação, gestão clínica, preferências
            <br />
            <strong>Bases legais:</strong> LGPD Art. 7º
            <br />
            <strong>Seus direitos:</strong> Acesso, retificação, exclusão, portabilidade
            <br />
            <strong>Contato DPO:</strong> privacidade@casadoamor.org.br
          </Typography>
        </Box>
      </Collapse>

      {/* Seção: Finalidades Essenciais (compacta) */}
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, fontSize: '1rem', color: ConsentColors.text.primary }}>
          Finalidades Essenciais
        </Typography>
        <Stack spacing={1.5}>
          {essentialPurposes.map((purpose) => (
            <ConsentPurposeToggle
              key={purpose.id}
              purpose={purpose}
              checked={localChoices[purpose.id] ?? true}
              onChange={handleToggle}
              disabled={isLoading}
            />
          ))}
        </Stack>
      </Box>

      {/* Seção: Finalidades Opcionais (compacta) */}
      {optionalPurposes.length > 0 && (
        <Box sx={{ mb: 2.5 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, fontSize: '1rem', color: ConsentColors.text.primary }}>
        Finalidades Opcionais
          </Typography>
          <Stack spacing={1.5}>
            {optionalPurposes.map((purpose) => (
              <ConsentPurposeToggle
                key={purpose.id}
                purpose={purpose}
                checked={localChoices[purpose.id] ?? false}
                onChange={handleToggle}
                disabled={isLoading}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Botão Salvar (sempre visível quando em modo personalizar) */}
      <Button
        onClick={handleSave}
        variant="contained"
        fullWidth
        disabled={isLoading || !hasChanges}
        startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
        sx={{
          height: 48,
          mt: 1,
          fontWeight: 600,
          borderRadius: 2,
          textTransform: 'none',
          fontSize: '0.9rem',
          backgroundColor: ConsentColors.primary.main,
          color: ConsentColors.primary.contrast,
          '&:hover': { backgroundColor: ConsentColors.primary.dark },
        }}
      >
        {isLoading ? 'Salvando...' : CONSENT_LABELS.savePreferencesButton}
      </Button>
      
      {!hasChanges && (
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            textAlign: 'center', 
            mt: 1.5, 
            color: ConsentColors.text.disabled,
            fontSize: '0.9rem',
          }}
        >
          Altere alguma preferência acima para habilitar o botão
        </Typography>
      )}
    </Box>
  );
}
