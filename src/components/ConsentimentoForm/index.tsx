import { useState } from 'react';
import { isAxiosError } from 'axios';
import {
  Box,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { consentimentoSchema, type ConsentimentoFormInputs } from '../../schemas/consentimentoSchema';
import { useRegistrarConsentimento, useClientInfo } from '../../hooks/useConsentimento';
import { toastSuccess, toastError } from '../../utils/toast';

interface ConsentimentoFormProps {
  profissionalUuid: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  obrigatorio?: boolean; // Se true, não permite pular
}

const ConsentimentoForm = ({ profissionalUuid, onSuccess, onCancel, obrigatorio = false }: ConsentimentoFormProps) => {
  const [showTermoCompleto, setShowTermoCompleto] = useState(false);
  const dialogTitleId = 'consentimento-lgpd-dialog-title';

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ConsentimentoFormInputs>({
    resolver: zodResolver(consentimentoSchema),
    defaultValues: {
      versaoTermo: '1.0.0',
      escopo: 'GERAL',
      concorda: false,
    },
  });

  const { data: clientInfo, isLoading: loadingClientInfo } = useClientInfo();
  const registrarConsentimento = useRegistrarConsentimento();

  const concordaValue = watch('concorda');

  // Captura metadata automaticamente
  const getMetadata = () => {
    const metadata = {
      dispositivo: /Mobile|Android|iPhone|iPad|iPod/.test(navigator.userAgent) ? 'mobile' : 'desktop',
      navegador: getBrowserName(),
      sistemaOperacional: getOS(),
      idioma: navigator.language,
      timestamp: new Date().toISOString(),
      resolucao: `${window.screen.width}x${window.screen.height}`,
    };
    return JSON.stringify(metadata);
  };

  const getBrowserName = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Outro';
  };

  const getOS = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Win')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Outro';
  };

  const onSubmit = async (data: ConsentimentoFormInputs) => {
    // Validação: se obrigatório, deve concordar
    if (obrigatorio && !data.concorda) {
      toastError('É necessário concordar com o termo para prosseguir.');
      return;
    }

    try {
      await registrarConsentimento.mutateAsync({
        profissionalUuid,
        data: {
          ...data,
          ipOrigem: clientInfo?.ipOrigem || '',
          userAgent: clientInfo?.userAgent || navigator.userAgent,
          metadata: getMetadata(), // Metadata capturado automaticamente
        },
      });

      toastSuccess(
        data.concorda
          ? 'Consentimento registrado com sucesso!'
          : 'Revogação registrada com sucesso!'
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error('Erro ao registrar consentimento:', error);
      const message = isAxiosError(error)
        ? error.response?.data?.message ?? 'Erro ao registrar consentimento. Tente novamente.'
        : error instanceof Error
          ? error.message
          : 'Erro ao registrar consentimento. Tente novamente.';
      toastError(message);
    }
  };

  const termoLGPD = `
TERMO DE CONSENTIMENTO PARA TRATAMENTO DE DADOS PESSOAIS

Versão: 1.0.0

Este documento visa registrar a manifestação livre, informada e inequívoca pela qual você (Titular) concorda com o tratamento de seus dados pessoais para finalidade específica, em conformidade com a Lei nº 13.709 – Lei Geral de Proteção de Dados Pessoais (LGPD).

Ao concordar com o presente termo, você consente e concorda que a CASA DO AMOR, CNPJ/CPF [número], doravante denominada Controlador, estabelecida na [endereço], tome decisões referentes ao tratamento de seus dados pessoais, bem como realize o tratamento de seus dados pessoais, envolvendo operações como as que se referem a coleta, produção, recepção, classificação, utilização, acesso, reprodução, transmissão, distribuição, processamento, arquivamento, armazenamento, eliminação, avaliação ou controle da informação, modificação, comunicação, transferência, difusão ou extração.

DADOS PESSOAIS
O Controlador fica autorizado a tomar decisões referentes ao tratamento e a realizar o tratamento dos seguintes dados pessoais do Titular:
- Nome completo
- CPF
- RG
- Data de nascimento
- Endereço residencial
- Telefone e e-mail
- Dados profissionais (registro, especialidade, etc.)

FINALIDADES DO TRATAMENTO DOS DADOS
O tratamento dos dados pessoais listados neste termo tem as seguintes finalidades:
- Cadastro no sistema de gestão clínica
- Controle de acesso ao sistema
- Comunicações relacionadas ao exercício profissional
- Cumprimento de obrigações legais e regulatórias
- Auditoria e segurança da informação

COMPARTILHAMENTO DE DADOS
O Controlador fica autorizado a compartilhar os dados pessoais do Titular com outros agentes de tratamento de dados, caso seja necessário para as finalidades listadas neste termo, observados os princípios e as garantias estabelecidas pela Lei nº 13.709.

SEGURANÇA DOS DADOS
O Controlador se responsabiliza por manter medidas de segurança, técnicas e administrativas aptas a proteger os dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou qualquer forma de tratamento inadequado ou ilícito.

DIREITOS DO TITULAR
O Titular tem direito a obter do Controlador, em relação aos dados por ele tratados, a qualquer momento e mediante requisição:
- Confirmação da existência de tratamento
- Acesso aos dados
- Correção de dados incompletos, inexatos ou desatualizados
- Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com o disposto na Lei nº 13.709
- Portabilidade dos dados a outro fornecedor de serviço ou produto
- Eliminação dos dados pessoais tratados com o consentimento do titular
- Informação das entidades públicas e privadas com as quais o controlador realizou uso compartilhado de dados
- Informação sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa
- Revogação do consentimento

REVOGAÇÃO DO CONSENTIMENTO
Este consentimento poderá ser revogado pelo Titular, a qualquer momento, mediante solicitação via e-mail ou correspondência ao Controlador.
  `.trim();

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Typography id={dialogTitleId} variant="h5" component="h2" gutterBottom>
        Consentimento LGPD
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate aria-labelledby={dialogTitleId}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Versão do Termo e Escopo */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Controller
              name="versaoTermo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Versão do Termo"
                  variant="outlined"
                  fullWidth
                  disabled
                  error={!!errors.versaoTermo}
                  helperText={errors.versaoTermo?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="escopo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Escopo"
                  variant="outlined"
                  fullWidth
                  autoFocus
                  error={!!errors.escopo}
                  helperText={errors.escopo?.message}
                  InputLabelProps={{ shrink: true }}
                  placeholder="Ex: GERAL, COMPARTILHAMENTO_DADOS, etc."
                />
              )}
            />
          </Box>

          {/* Termo de Consentimento */}
          <Box>
            <Box
              tabIndex={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                maxHeight: showTermoCompleto ? 400 : 200,
                overflow: 'auto',
                // Make the scrollable region keyboard-focusable for accessibility
                bgcolor: 'background.default',
              }}
            >
              <Typography
                variant="body2"
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                }}
              >
                {termoLGPD}
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={() => setShowTermoCompleto(!showTermoCompleto)}
              sx={{ mt: 1 }}
            >
              {showTermoCompleto ? 'Mostrar menos' : 'Ler termo completo'}
            </Button>
          </Box>

          {/* Checkbox de Consentimento */}
          <Box>
            <Controller
              name="concorda"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={field.onChange}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: field.value ? 600 : 400 }}>
                      {field.value
                        ? '✓ Concordo com os termos acima'
                        : '⚠️ Declaro que li e concordo com os termos de consentimento LGPD'}
                    </Typography>
                  }
                />
              )}
            />
            {errors.concorda && (
              <Alert severity="error" sx={{ mt: 1 }}>
                <Typography variant="caption">
                  {errors.concorda.message}
                </Typography>
              </Alert>
            )}
            {obrigatorio && !concordaValue && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                <Typography variant="caption">
                  É obrigatório concordar com os termos para prosseguir com o cadastro/login.
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Informações do Cliente */}
          {loadingClientInfo ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} aria-label="Obtendo informações do cliente" />
                <Typography variant="caption">Obtendo informações do cliente...</Typography>
              </Box>
            </Box>
          ) : (
            clientInfo && (
              <Box>
                <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                  <Typography variant="caption" component="div">
                    <strong>IP de Origem:</strong> {clientInfo.ipOrigem || 'Não disponível'}
                  </Typography>
                  <Typography variant="caption" component="div" sx={{ mt: 0.5 }}>
                    <strong>Navegador:</strong>{' '}
                    {clientInfo.userAgent?.substring(0, 100) || 'Não disponível'}
                    {clientInfo.userAgent && clientInfo.userAgent.length > 100 && '...'}
                  </Typography>
                </Alert>
              </Box>
            )
          )}

          {/* Botões */}
          <Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  sx={{ minWidth: 120 }}
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                color={concordaValue ? 'success' : 'error'}
                disabled={isSubmitting || loadingClientInfo}
                sx={{ minWidth: 120 }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} aria-label="Enviando consentimento" />
                ) : concordaValue ? (
                  'Registrar Consentimento'
                ) : (
                  'Registrar Revogação'
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </form>
    </Paper>
  );
};

export default ConsentimentoForm;
