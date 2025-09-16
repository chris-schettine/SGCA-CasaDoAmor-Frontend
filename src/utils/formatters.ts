/**
 * Remove todos os caracteres não numéricos (pontos, traços, parênteses, espaços, etc.) de uma string.
 * Útil para limpar CPFs, RGs, telefones, CEPS e outros números antes de enviar para o backend.
 */
export const removeNonNumeric = (value: string | undefined | null): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return value.replace(/\D/g, ''); // O '\D' corresponde a qualquer caractere que NÃO seja um dígito
};

export const formatDateToISO = (dateString: string): string => {
  // Verifica se a string está no formato DD/MM/YYYY
  const dateParts = dateString.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (dateParts) {
    const day = dateParts[1];
    const month = dateParts[2];
    const year = dateParts[3];
    return `${year}-${month}-${day}`;
  }

  // Se não for o formato esperado, tenta criar um Date object para validar
  // e retornar ISO string se possível, ou a original.
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) { // Checa se a data é válida
      // toISOString retorna YYYY-MM-DDTHH:mm:ss.sssZ, então pegamos apenas a parte da data
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    // Fallback para retornar a string original em caso de erro na data
    console.warn("Could not parse date, returning original string:", dateString, e);
  }

  return dateString; // Retorna a string original se não puder ser formatada
};