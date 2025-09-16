export const calculateAge = (dateString: string): number | null => {
  if (!dateString) {
    return null; // Vazia
  }

  const parts = dateString.split('/');
  if (parts.length !== 3) {
    return null; // Formato inválido
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Mês é base 0 (janeiro = 0)
  const year = parseInt(parts[2], 10);

  const birthDate = new Date(year, month, day);

  if (isNaN(birthDate.getTime()) || birthDate.getMonth() !== month || birthDate.getDate() !== day) {
    return null; // Data inválida 
  }

  const today = new Date();

  if (birthDate > today) {
    return null; // Não se pode nascer no futuro (só em Dark)
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--; // Porque ainda não completou aniversário
  }

  return age;
}