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

export const formatISOToDDMMYYYY = (isoString: string | undefined | null): string => {
  if (!isoString) return '';
  const datePart = isoString.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return isoString;
};

/**
 * Formata uma string ISO para data+hora no timezone local do usuário.
 * Exemplo: "28/10/2025 14:35 BRT" (formato pode variar conforme o ambiente/browser)
 */
export const formatISOToLocalDateTime = (isoString: string | undefined | null): string => {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    // Usa Intl.DateTimeFormat para respeitar locale e timezone do usuário
    const dtf = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      // second: '2-digit',
      hour12: false,
      timeZoneName: 'short'
    });
    // dtf.format returns something like '28/10/2025 14:35 BRT'
    return dtf.format(d);
  } catch (e) {
    console.warn('formatISOToLocalDateTime failed for', isoString, e);
    return isoString;
  }
};

export const formatRG = (rg?: string | null): string => {
  if (!rg) return '';
  const digits = rg.replace(/\D/g, '');
  // formato comum: 9 dígitos -> 00.000.000-0
  if (digits.length === 9) {
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{1})$/, "$1.$2.$3-$4");
  }
  // se já estiver formatado ou tiver outro tamanho, retorne limpando espaços
  return rg;
};

export const formatCPF = (cpf?: string | null): string => {
  if (!cpf) return '';
  const digits = cpf.replace(/\D/g, '');
  if (digits.length === 11) {
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  return cpf;
};

export const formatPhone = (phone?: string | null): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  // 11 dígitos (DDD + 9) -> 00 00000-0000
  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "$1 $2-$3");
  }
  // 10 dígitos (DDD + 8) -> 00 0000-0000 (still acceptable)
  if (digits.length === 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "$1 $2-$3");
  }
  return phone;
};