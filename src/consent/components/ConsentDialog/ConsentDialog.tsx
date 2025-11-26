import React, { useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
  Box,
  Link,
  Divider,
  Stack,
  Chip,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// ExpandMoreIcon moved to shared technical details component
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import BlockIcon from '@mui/icons-material/Block';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  CONSENT_LABELS,
  CONSENT_TERMS_SUMMARY,
} from '../../config/consentConfig';
import { ConsentPreferencesPanel } from '../ConsentPreferencesPanel/ConsentPreferencesPanel';
import ConsentTechnicalDetails from '../ConsentTechnicalDetails/ConsentTechnicalDetails';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useTransition } from '../../../motion/TransitionProvider';
import type { ConsentChoice } from '../../types/consent.types';
import { ConsentColors } from '../../config/designTokens';
import { ConsentAnalytics } from '../../analytics/consentAnalytics';

interface ConsentDialogProps {
  open: boolean;
  onClose: () => void;
  onAcceptAll: () => void;
  onRejectNonEssential: () => void;
  onSavePreferences: (choices: ConsentChoice) => void;
  currentChoices?: ConsentChoice;
  isLoading?: boolean;
  /**
   * Modo "obrigatório" (primeira visita)
   * - Se true: Não permite fechar sem escolher
   * - Se false: Permite ESC/Close
   */
  required?: boolean;
  /**
   * Callback quando usuário recusa completamente o consentimento
   * Deve fazer logout (admin) ou cancelar cadastro (novo usuário)
   */
  onCompleteRejection?: () => void;
}

/**
 * Dialog principal de consentimento LGPD
 * 
 * Acessibilidade (WCAG 2.2 AA):
 * - role="dialog" + aria-modal
 * - aria-labelledby + aria-describedby
 * - Focus trap (Tab/Shift+Tab)
 * - Retorno de foco ao fechar
 * - ESC fecha dialog (se não obrigatório)
 * - Botão X visível com aria-label
 * - Touch targets ≥44x44px
 * 
 * UX:
 * - 3 botões: Aceitar Todos, Apenas Essenciais, Salvar Preferências
 * - Termos expandíveis (não prolixa)
 * - Link para Política de Privacidade
 * 
 * @example
 * ```tsx
 * <ConsentDialog
 *   open={showDialog}
 *   onClose={handleClose}
 *   onAcceptAll={handleAcceptAll}
 *   onRejectNonEssential={handleReject}
 *   onSavePreferences={handleSave}
 *   required={true}
 * />
 * ```
 */
export function ConsentDialog({
  open,
  onClose,
  onAcceptAll,
  onRejectNonEssential,
  onSavePreferences,
  currentChoices,
  isLoading = false,
  required = false,
  onCompleteRejection,
}: ConsentDialogProps) {
  if (import.meta.env.DEV) console.debug('[ConsentDialog] render', { open, required, hasCompleteRejection: !!onCompleteRejection });
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  // showFullTerms is now handled inside the shared ConsentTechnicalDetails component
  const [showPreferences, setShowPreferences] = useState(false);

  const { tokens, reducedMotion } = useTransition();

  // Focus trap (WCAG 2.1.2) - call hook at top-level to respect rules-of-hooks
  useFocusTrap(dialogRef as React.RefObject<HTMLElement>, open);

  // Salvar foco anterior (WCAG 2.4.3)
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Analytics: Dialog mostrado
      ConsentAnalytics.trackDialogShown(
        required ? 'first_visit' : 'manual'
      );
    }
  }, [open, required]);

  // Restaurar foco ao fechar
  const handleClose = React.useCallback((method: 'escape' | 'close_button' | 'backdrop' = 'close_button') => {
    if (required) {
      // Não permitir fechar sem escolher
      ConsentAnalytics.trackDialogClosed(method);
      return;
    }

    ConsentAnalytics.trackDialogClosed(method);
    onClose();
    setTimeout(() => previousFocusRef.current?.focus(), 0);
  }, [required, onClose]);

  // ESC para fechar (se não obrigatório)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !required) {
        handleClose('escape');
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, required, handleClose]);

  const handleAcceptAll = () => {
    onAcceptAll();
  };

  const handleRejectNonEssential = () => {
    onRejectNonEssential();
  };

  const handleRejectAll = () => {
    if (import.meta.env.DEV) console.debug('[ConsentDialog] handleRejectAll called', { required, hasCallback: !!onCompleteRejection });

    // Se obrigatório, chama callback de rejeição completa (logout/cancelar cadastro)
    if (required && onCompleteRejection) {
      try {
        onCompleteRejection();
      } catch (err) {
        console.error('[ConsentDialog] onCompleteRejection threw error:', err);
      }
    } else {
      // Se opcional, apenas fecha
      if (import.meta.env.DEV) console.debug('[ConsentDialog] optional reject -> closing dialog');
      onClose();
    }
  };

  const handleSavePreferences = (choices: ConsentChoice) => {
    onSavePreferences(choices);
  };

  return (
    <Dialog
      ref={dialogRef}
      open={open}
      onClose={(_, reason) => {
        // Prevent backdrop/escape from closing when required
        if ((reason === 'backdropClick' || reason === 'escapeKeyDown') && required) {
          // track attempt but do nothing
          ConsentAnalytics.trackDialogClosed(reason === 'backdropClick' ? 'backdrop' : 'escape');
          return;
        }

        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          handleClose(reason === 'backdropClick' ? 'backdrop' : 'escape');
        }
      }}
      maxWidth="sm"
      fullWidth
      aria-labelledby="consent-dialog-title"
      aria-describedby="consent-dialog-description"
      data-testid="dialog-consent"
      aria-live="polite"
      disableEscapeKeyDown={required}
      transitionDuration={reducedMotion ? 0 : tokens.duration.modal}
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '85vh',
        },
      }}
    >
      {/* ========== HEADER ========== */}
      <DialogTitle 
        id="consent-dialog-title"
        sx={{
          pb: 3,
          // solid header color (no gradient) as requested
          backgroundColor: ConsentColors.primary.main,
          color: ConsentColors.primary.contrast,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle1"
              component="h2"
              sx={{
                fontWeight: 700,
                mb: 0.75,
                fontSize: '1rem',
                color: ConsentColors.primary.contrast,
                WebkitTextFillColor: ConsentColors.primary.contrast,
                opacity: 1,
              }}
            >
              {CONSENT_LABELS.dialogTitle}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.95,
                fontSize: '0.9rem',
                lineHeight: 1.6,
                color: ConsentColors.primary.contrast,
                WebkitTextFillColor: ConsentColors.primary.contrast,
              }}
            >
              {CONSENT_LABELS.dialogDescription}
            </Typography>
          </Box>

          {/* Botão Fechar (apenas disponível quando não obrigatório ou após abrir preferências) */}
          {(!required || showPreferences) && (
            <IconButton
              onClick={() => handleClose('close_button')}
              aria-label={CONSENT_LABELS.closeButton}
              sx={{
                color: 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.15)' },
              }}
            >
              <CloseIcon aria-hidden="true" />
            </IconButton>
          )}
        </Box>

        {required && (
          <Chip
            label="Consentimento obrigatório"
            size="small"
            sx={{
              mt: 1.5,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: ConsentColors.primary.contrast,
              WebkitTextFillColor: ConsentColors.primary.contrast,
              fontSize: '0.75rem',
              opacity: 1,
            }}
          />
        )}
      </DialogTitle>

      {/* ========== CONTENT ========== */}
      <DialogContent sx={{ pt: 3.5, pb: 2 }}>
        {/* Resumo do Termo */}
        <Typography
          id="consent-dialog-description"
          variant="body2"
          sx={{
            lineHeight: 1.7,
            color: ConsentColors.text.primary,
            mb: 3,
            mt: 2,
            fontSize: '0.9rem',
            maxWidth: '66ch',
          }}
        >
          {/* Render minimal markdown-like link if present in the summary */}
          {(() => {
            const text = CONSENT_TERMS_SUMMARY || '';
            // find markdown link [text](url)
            const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            const parts: Array<string | React.ReactNode> = [];
            let lastIndex = 0;
            let match: RegExpExecArray | null;
            while ((match = mdLinkRegex.exec(text)) !== null) {
              const [full, label, url] = match;
              const idx = match.index;
              if (idx > lastIndex) parts.push(text.substring(lastIndex, idx));
              parts.push(
                <Link
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: ConsentColors.primary.main }}
                >
                  {label}
                </Link>
              );
              lastIndex = idx + full.length;
            }
            if (lastIndex < text.length) parts.push(text.substring(lastIndex));
            if (parts.length === 0) return text;
            return parts.map((p, i) => (
              <span key={i}>
                {p}
              </span>
            ));
          })()}
        </Typography>

        {/* Link para Política */}
        {/* Intentionally removed standalone policy title per request; links should appear inline in the summary or in context. */}

        {/* Shared technical details toggle + content (shared component for consistency) */}
        <ConsentTechnicalDetails />

        <Divider sx={{ my: 2 }} />

        {/* Painel de Preferências (colapsável) */}
        {showPreferences ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SettingsIcon color="primary" fontSize="small" aria-hidden="true" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Personalize suas preferências
              </Typography>
            </Box>
            <ConsentPreferencesPanel
              currentChoices={currentChoices}
              onSave={handleSavePreferences}
              isLoading={isLoading}
            />
          </Box>
        ) : (
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center', 
              color: ConsentColors.text.secondary, 
              py: 1,
              fontSize: '0.875rem',
            }}
          >
            Escolha uma das opções abaixo ou personalize suas preferências.
          </Typography>
        )}
      </DialogContent>

      {/* ========== ACTIONS ========== */}
  <DialogActions sx={{ p: 2.5, pt: 1.5, gap: 1.5, flexDirection: 'column', position: 'sticky', bottom: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.96))', zIndex: 10 }}>
        {!showPreferences && (
          <Stack spacing={1.5} sx={{ width: '100%' }}>
            {/* Apenas mantém Gerenciar Preferências */}
            <Button
              onClick={() => setShowPreferences(true)}
              variant="contained"
              disabled={isLoading}
              fullWidth
              startIcon={<SettingsIcon aria-hidden="true" />}
              sx={{
                height: 48,
                fontWeight: 600,
                fontSize: '0.9375rem',
                textTransform: 'none',
                borderRadius: 2,
                backgroundColor: ConsentColors.primary.main,
                color: ConsentColors.primary.contrast,
                '&:hover': {
                  backgroundColor: ConsentColors.primary.dark,
                },
              }}
            >
              Gerenciar preferências
            </Button>

              {/* Botão: Não Assinar (somente quando consentimento é obrigatório) */}
              {required && (
                <Button
                  onClick={handleRejectAll}
                  variant="outlined"
                  disabled={isLoading}
                  fullWidth
                  // The button label communicates the saving state, hide the visual spinner from AT
                  startIcon={isLoading ? <CircularProgress size={18} color="inherit" aria-hidden /> : <CancelIcon aria-hidden="true" />}
                  sx={{
                    height: 44,
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    textTransform: 'none',
                    color: ConsentColors.error.dark,
                    borderColor: ConsentColors.error.main,
                  }}
                  aria-label="Recusar tudo e cancelar cadastro"
                  data-testid="consent-reject-all"
                  onPointerDown={() => { if (import.meta.env.DEV) console.debug('[ConsentDialog] onPointerDown reject button'); }}
                  onMouseDown={() => { if (import.meta.env.DEV) console.debug('[ConsentDialog] onMouseDown reject button'); }}
                >
                  Recusar tudo (cancela cadastro)
                </Button>
              )}
          </Stack>
        )}

        {showPreferences && (
          <Button
            onClick={() => setShowPreferences(false)}
            variant="text"
            size="small"
            sx={{ textTransform: 'none', alignSelf: 'center', fontSize: '0.875rem' }}
          >
            ← Voltar para opções rápidas
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
