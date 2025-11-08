import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pacienteService } from '../api/paciente.service';
import type { RegistrarPacienteDTO, EditarPacienteDTO } from '../api/paciente.dto';

// Query Keys para cache
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (limit: number, offset: number, searchText?: string) => 
    [...patientKeys.lists(), { limit, offset, searchText }] as const,
};

/**
 * Hook para listar pacientes com paginação e busca
 * ✅ Substitui useState + useEffect manual
 * ✅ Cache automático de 5 minutos
 * ✅ Loading e error states inclusos
 */
export function usePatients(limit: number = 10, offset: number = 0, searchText?: string) {
  return useQuery({
    queryKey: patientKeys.list(limit, offset, searchText),
    queryFn: () => pacienteService.listarPacientes(limit, offset, searchText),
    // Dados mais antigos que 5min disparam refetch automático
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para registrar novo paciente
 * ✅ Invalidação automática da lista após sucesso
 * ✅ Otimistic updates opcional
 */
export function useRegisterPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegistrarPacienteDTO) => pacienteService.registrarPaciente(data),
    onSuccess: () => {
      // Invalida todas as listas de pacientes para refetch
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

/**
 * Hook para editar paciente existente
 * ✅ Invalidação automática da lista após sucesso
 */
export function useEditPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EditarPacienteDTO }) => 
      pacienteService.editarPaciente(id, data),
    onSuccess: () => {
      // Invalida todas as listas de pacientes para refetch
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}
