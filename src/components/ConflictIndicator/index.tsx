import { Alert, AlertTitle } from '@mui/material';
import type { ConflictCheckResponse } from '../../api/agendamentoPaciente.dto';

interface ConflictIndicatorProps {
  conflict: ConflictCheckResponse | null;
  loading?: boolean;
}

export default function ConflictIndicator({ conflict, loading }: ConflictIndicatorProps) {
  if (loading) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        Verificando disponibilidade...
      </Alert>
    );
  }

  if (!conflict) {
    return null;
  }

  if (!conflict.temConflito) {
    return (
      <Alert severity="success" sx={{ mt: 2 }}>
        ✓ {conflict.mensagem}
      </Alert>
    );
  }

  return (
    <Alert severity="error" sx={{ mt: 2 }}>
      <AlertTitle>⚠️ {conflict.mensagem}</AlertTitle>
      {conflict.details && (
        <>
          <strong>{conflict.details.tipo}:</strong> {conflict.details.descricao}
          <br />
          <small>
            Horário conflitante:{' '}
            {new Date(conflict.details.conflitanteInicio).toLocaleString('pt-BR')} -{' '}
            {new Date(conflict.details.conflitanteFim).toLocaleString('pt-BR')}
          </small>
          <br />
          <small>Profissional: {conflict.details.profissionalNome}</small>
        </>
      )}
    </Alert>
  );
}
