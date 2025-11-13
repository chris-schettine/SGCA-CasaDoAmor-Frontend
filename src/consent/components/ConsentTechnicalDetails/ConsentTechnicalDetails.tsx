import { useState } from 'react';
import { Box, Typography, Collapse, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ConsentColors } from '../../config/designTokens';

/**
 * Componente compartilhado para exibir os detalhes técnicos do consentimento.
 * Usa o mesmo markup, estilos e comportamento do ConsentDialog para garantir
 * consistência entre telas.
 */
export function ConsentTechnicalDetails() {
  const [showFullTerms, setShowFullTerms] = useState(false);

  return (
    <>
      <Collapse in={showFullTerms} id="consent-technical-details-shared">
        <Box
          sx={{
            mt: 2,
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

      <Button
        onClick={() => setShowFullTerms((p) => !p)}
        size="small"
        aria-expanded={showFullTerms}
        aria-controls="consent-technical-details-shared"
        endIcon={
          <ExpandMoreIcon
            aria-hidden="true"
            sx={{
              transform: showFullTerms ? 'rotate(180deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
            }}
          />
        }
        sx={{
          mt: 1.5,
          mb: 2,
          textTransform: 'none',
          fontSize: '0.8125rem',
          color: ConsentColors.text.secondary,
          display: 'flex',
          alignSelf: 'flex-start',
          // remove internal horizontal spacing so text sits flush with container edge
          padding: 0,
          paddingLeft: 0,
          paddingRight: 0,
          pl: 0,
          pr: 0,
          px: 0,
          minWidth: 0,
          justifyContent: 'flex-start',
          // ensure no horizontal gap from Button internals
          '&.MuiButton-root': {
            paddingLeft: 0,
            paddingRight: 0,
          },
          // tighten icon spacing to keep endIcon near the text
          '& .MuiButton-endIcon': {
            marginLeft: 6,
          },
          '& .MuiButton-startIcon': {
            marginRight: 6,
          },
        }}
      >
        {showFullTerms ? 'Ocultar detalhes técnicos' : 'Ver detalhes técnicos'}
      </Button>
    </>
  );
}

export default ConsentTechnicalDetails;
