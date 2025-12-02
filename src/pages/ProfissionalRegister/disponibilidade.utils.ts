/**
 * Utilities for handling professional availability (disponibilidade)
 */

export type DiasSemanais = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';

export type DisponibilidadeHorario = {
  segunda?: string[];
  terca?: string[];
  quarta?: string[];
  quinta?: string[];
  sexta?: string[];
  sabado?: string[];
  domingo?: string[];
};

export const DIAS_SEMANA: { label: string; value: DiasSemanais }[] = [
  { label: 'Segunda', value: 'segunda' },
  { label: 'Terça', value: 'terca' },
  { label: 'Quarta', value: 'quarta' },
  { label: 'Quinta', value: 'quinta' },
  { label: 'Sexta', value: 'sexta' },
  { label: 'Sábado', value: 'sabado' },
  { label: 'Domingo', value: 'domingo' },
];

/**
 * Parse time range string like "08:00-12:00" into start and end
 */
export const parseTimeRange = (range: string): { inicio: string; fim: string } | null => {
  const match = range.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
  if (!match) return null;
  
  return {
    inicio: `${match[1]}:${match[2]}`,
    fim: `${match[3]}:${match[4]}`,
  };
};

/**
 * Format start and end time into range string like "08:00-12:00"
 */
export const formatTimeRange = (inicio: string, fim: string): string => {
  return `${inicio}-${fim}`;
};

/**
 * Convert disponibilidade object to display format
 */
export const formatDisponibilidadeDisplay = (disponibilidade?: DisponibilidadeHorario): string => {
  if (!disponibilidade || Object.keys(disponibilidade).length === 0) {
    return 'Nenhuma disponibilidade definida';
  }

  return Object.entries(disponibilidade)
    .map(([dia, horarios]) => {
      const diaLabel = DIAS_SEMANA.find(d => d.value === dia)?.label || dia;
      return `${diaLabel}: ${horarios?.join(', ') || '-'}`;
    })
    .join('\n');
};
