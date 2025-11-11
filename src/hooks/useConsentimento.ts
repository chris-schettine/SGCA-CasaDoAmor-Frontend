import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { consentimentoService } from '../api/consentimento.service';
import type {
  ConsentimentoLGPDRequest,
  Pageable,
} from '../api/consentimento.dto';

/**
 * Query Keys para gerenciamento de cache
 */
export const consentimentoKeys = {
  all: ['consentimentos'] as const,
  lists: () => [...consentimentoKeys.all, 'list'] as const,
  list: (profissionalUuid: string, pageable?: Pageable) =>
    [...consentimentoKeys.lists(), profissionalUuid, pageable] as const,
  details: () => [...consentimentoKeys.all, 'detail'] as const,
  detail: (profissionalUuid: string, consentimentoUuid: string) =>
    [...consentimentoKeys.details(), profissionalUuid, consentimentoUuid] as const,
};

/**
 * Hook para listar consentimentos de um profissional
 */
export function useConsentimentos(profissionalUuid: string, pageable?: Pageable) {
  return useQuery({
    queryKey: consentimentoKeys.list(profissionalUuid, pageable),
    queryFn: () => consentimentoService.listarConsentimentos(profissionalUuid, pageable),
    enabled: !!profissionalUuid,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar um consentimento específico
 */
export function useConsentimento(profissionalUuid: string, consentimentoUuid: string) {
  return useQuery({
    queryKey: consentimentoKeys.detail(profissionalUuid, consentimentoUuid),
    queryFn: () =>
      consentimentoService.buscarConsentimento(profissionalUuid, consentimentoUuid),
    enabled: !!profissionalUuid && !!consentimentoUuid,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para registrar um novo consentimento
 */
export function useRegistrarConsentimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      profissionalUuid,
      data,
    }: {
      profissionalUuid: string;
      data: ConsentimentoLGPDRequest;
    }) => consentimentoService.registrarConsentimento(profissionalUuid, data),
    onSuccess: () => {
      // Invalida a lista de consentimentos do profissional
      queryClient.invalidateQueries({
        queryKey: consentimentoKeys.lists(),
      });
    },
  });
}

/**
 * Hook para obter informações do cliente (IP e User Agent)
 */
export function useClientInfo() {
  return useQuery({
    queryKey: ['clientInfo'],
    queryFn: async () => {
      const [ipOrigem, userAgent] = await Promise.all([
        consentimentoService.obterIpPublico(),
        Promise.resolve(consentimentoService.obterUserAgent()),
      ]);
      return { ipOrigem, userAgent };
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}
