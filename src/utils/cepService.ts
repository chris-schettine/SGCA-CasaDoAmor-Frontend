interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  erro?: boolean;
}

export const fetchAddressByCep = async (cep: string): Promise<ViaCepResponse | null> => {
  // Remove qualquer formatação do CEP para a requisição (ex: 45000-000 -> 45000000)
  const cleanedCep = cep.replace(/\D/g, '');

  if (cleanedCep.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);

    if (!response.ok) {
      console.error("Erro ao buscar CEP:", response.statusText);
      return null;
    }

    const data: ViaCepResponse = await response.json();

    if (data.erro) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro na requisição da API ViaCEP:", error);
    return null;
  }
};