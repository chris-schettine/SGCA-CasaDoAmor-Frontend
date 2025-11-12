import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { acompanhanteService } from '../api/acompanhante.service';
import type {
  RegistrarAcompanhanteDTO,
  EditarAcompanhanteDTO,
  ListaAcompanhantesDTO,
} from '../api/acompanhante.dto';

/**
 * Hook para listar acompanhantes com paginação
 */
export const useAcompanhantes = (
  limit: number = 10,
  offset: number = 0,
  searchText?: string
) => {
  return useQuery<ListaAcompanhantesDTO>({
    queryKey: ['acompanhantes', limit, offset, searchText],
    queryFn: () => acompanhanteService.listarAcompanhantes(limit, offset, searchText),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para registrar um novo acompanhante
 */
export const useRegistrarAcompanhante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: RegistrarAcompanhanteDTO) => 
      acompanhanteService.registrarAcompanhante(dto),
    onSuccess: (_data, variables) => {
      // Invalida a query de listagem geral
      queryClient.invalidateQueries({ queryKey: ['acompanhantes'] });
      // Invalida especificamente a query dos acompanhantes deste paciente
      if (variables.pacienteId) {
        queryClient.invalidateQueries({ 
          queryKey: ['acompanhantes', 'paciente', variables.pacienteId] 
        });
      }
    },
  });
};

/**
 * Hook para editar um acompanhante existente
 */
export const useEditarAcompanhante = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: EditarAcompanhanteDTO }) =>
      acompanhanteService.editarAcompanhante(id, dto),
    onSuccess: () => {
      // Invalida a query de listagem para forçar refetch
      queryClient.invalidateQueries({ queryKey: ['acompanhantes'] });
    },
  });
};

/**
 * Hook para buscar acompanhantes de um paciente específico com paginação
 */
export const useAcompanhantesPorPaciente = (
  pacienteId?: string,
  limit: number = 10,
  offset: number = 0
) => {
  return useQuery<ListaAcompanhantesDTO>({
    queryKey: ['acompanhantes', 'paciente', pacienteId, limit, offset],
    queryFn: () => acompanhanteService.buscarAcompanhantesPorPaciente(pacienteId!, limit, offset),
    enabled: !!pacienteId, // Só executa se tiver pacienteId
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
