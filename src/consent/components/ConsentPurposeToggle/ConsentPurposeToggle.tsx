import { Box, Typography, Switch, FormControlLabel, Chip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import type { ConsentPurpose } from '../../types/consent.types';
import { ConsentColors } from '../../config/designTokens';

interface ConsentPurposeToggleProps {
  purpose: ConsentPurpose;
  checked: boolean;
  onChange: (purposeId: string, checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Toggle individual para uma finalidade de consentimento
 * 
 * Comportamento:
 * - Finalidades essenciais: Switch desabilitado + tooltip explicativo
 * - Finalidades opcionais: Switch funcional
 * - Acessibilidade: aria-describedby para descrição longa
 * 
 * @example
 * ```tsx
 * <ConsentPurposeToggle
 *   purpose={CONSENT_PURPOSES[0]}
 *   checked={choices['essential_auth']}
 *   onChange={handleChange}
 * />
 * ```
 */
export function ConsentPurposeToggle({
  purpose,
  checked,
  onChange,
  disabled = false,
}: ConsentPurposeToggleProps) {
  const isDisabled = disabled || !purpose.userCanDisable;
  const descriptionId = `consent-purpose-${purpose.id}-description`;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isDisabled) {
      onChange(purpose.id, event.target.checked);
    }
  };

  return (
    <Box
      sx={{
        p: 1.5,
        border: '1px solid',
        borderColor: isDisabled ? ConsentColors.border.default : ConsentColors.border.default,
        borderRadius: 2,
        backgroundColor: isDisabled ? ConsentColors.surface.default : 'transparent',
        transition: 'all 0.15s ease-in-out',
        '&:hover': !isDisabled ? {
          borderColor: ConsentColors.primary.light,
          backgroundColor: 'rgba(13, 46, 77, 0.02)',
        } : {},
      }}
    >
      <FormControlLabel
        control={
          <Switch
            checked={checked}
            onChange={handleChange}
            disabled={isDisabled}
            size="small"
            inputProps={{
              'aria-describedby': descriptionId,
              'aria-label': `${purpose.label} - ${checked ? 'ativado' : 'desativado'}`,
            }}
          />
        }
        label={
          <Box sx={{ ml: 1, flex: 1 }}>
            {/* Título + Badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: ConsentColors.text.primary,
                }}
              >
                {purpose.label}
              </Typography>
              {!purpose.userCanDisable && (
                <Chip
                  icon={<LockIcon sx={{ fontSize: '0.75rem' }} />}
                  label="Obrigatório"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.6875rem',
                    backgroundColor: ConsentColors.surface.hover,
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              )}
            </Box>

            {/* Descrição (compacta) */}
            <Typography
              id={descriptionId}
              variant="caption"
              sx={{
                display: 'block',
                fontSize: '0.9rem',
                color: ConsentColors.text.secondary,
                lineHeight: 1.4,
              }}
            >
              {purpose.description}
            </Typography>
          </Box>
        }
        sx={{
          m: 0,
          alignItems: 'flex-start',
          width: '100%',
        }}
      />
    </Box>
  );
}
