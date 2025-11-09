/**
 * DevTools - Utilitários para desenvolvimento
 * Apenas para ambiente de desenvolvimento!
 * Gera dados fake realistas para testes de formulários
 */

import { faker } from '@faker-js/faker/locale/pt_BR';

/**
 * Gera um CPF fake (formato válido mas não real)
 */
export const generateFakeCPF = (): string => {
  // Gera CPF no formato XXX.XXX.XXX-XX
  const n1 = faker.number.int({ min: 100, max: 999 });
  const n2 = faker.number.int({ min: 100, max: 999 });
  const n3 = faker.number.int({ min: 100, max: 999 });
  const n4 = faker.number.int({ min: 10, max: 99 });
  return `${n1}.${n2}.${n3}-${n4}`;
};

/**
 * Gera um telefone brasileiro fake
 */
export const generateFakePhone = (): string => {
  const ddd = faker.number.int({ min: 11, max: 99 });
  const number = faker.number.int({ min: 90000, max: 99999 });
  const suffix = faker.number.int({ min: 1000, max: 9999 });
  return `${ddd} ${number}-${suffix}`;
};

/**
 * Gera uma data de nascimento fake (entre 18 e 90 anos atrás)
 */
export const generateFakeBirthDate = (): string => {
  const date = faker.date.birthdate({ min: 18, max: 90, mode: 'age' });
  return date.toLocaleDateString('pt-BR');
};

/**
 * Gera um CEP brasileiro válido de uma lista real
 */
export const generateFakeCEP = (): string => {
  // Lista de CEPs reais do Brasil (diferentes cidades)
  const cepsValidos = [
    '01310-100', // São Paulo - Av. Paulista
    '20040-020', // Rio de Janeiro - Centro
    '30130-100', // Belo Horizonte - Centro
    '40020-000', // Salvador - Centro
    '50010-000', // Recife - Centro
    '60060-440', // Fortaleza - Centro
    '70040-020', // Brasília - Asa Sul
    '80010-000', // Curitiba - Centro
    '90010-270', // Porto Alegre - Centro
    '66010-020', // Belém - Centro
    '69005-040', // Manaus - Centro
    '49010-010', // Aracaju - Centro
    '57020-020', // Maceió - Centro
    '58010-760', // João Pessoa - Centro
    '59012-300', // Natal - Centro
    '64000-060', // Teresina - Centro
    '65010-440', // São Luís - Centro
    '78008-000', // Cuiabá - Centro
    '79002-070', // Campo Grande - Centro
    '88010-400', // Florianópolis - Centro
  ];
  return faker.helpers.arrayElement(cepsValidos);
};

/**
 * Helper para preencher campos select do Material-UI
 * Usa múltiplas estratégias para garantir que o valor seja aplicado
 */
const fillSelect = (
  fieldName: string,
  value: any,
  setValue: any,
  elementId?: string,
  options?: {
    shouldValidate?: boolean;
    shouldDirty?: boolean;
    shouldTouch?: boolean;
    clearFallback?: any;
  }
) => {
  const {
    shouldValidate = true,
    shouldDirty = true,
    shouldTouch = true,
    clearFallback = '',
  } = options || {};

  const isClearing = value === undefined || value === null || value === '';
  const formValue = isClearing ? clearFallback : value;
  const domValue = isClearing ? String(clearFallback ?? '') : (value ?? '');

  // 1. Atualiza via react-hook-form
  setValue(fieldName, formValue, { shouldValidate, shouldDirty, shouldTouch });

  const setNativeValue = (element: HTMLInputElement | HTMLSelectElement, newValue: string) => {
    const prototype = Object.getPrototypeOf(element);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
    if (descriptor?.set) {
      descriptor.set.call(element, newValue);
    } else {
      (element as unknown as { value: string }).value = newValue;
    }
  };

  // 2. Tenta atualizar o DOM diretamente (para Material-UI)
  setTimeout(() => {
    const candidates: (HTMLInputElement | HTMLSelectElement | null)[] = [];

    if (elementId) {
      const byId = document.getElementById(elementId);
      if (byId instanceof HTMLInputElement || byId instanceof HTMLSelectElement) {
        candidates.push(byId);
      }
      if (byId) {
        candidates.push(byId.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement | null);
        candidates.push(byId.querySelector(`select[name="${fieldName}"]`) as HTMLSelectElement | null);
        candidates.push(byId.querySelector('input') as HTMLInputElement | null);
        candidates.push(byId.querySelector('select') as HTMLSelectElement | null);
      }
    }

    candidates.push(document.querySelector(`input[name="${fieldName}"]`) as HTMLInputElement | null);
    candidates.push(document.querySelector(`select[name="${fieldName}"]`) as HTMLSelectElement | null);

    const target = candidates.find(
      (candidate): candidate is HTMLInputElement | HTMLSelectElement =>
        candidate instanceof HTMLInputElement || candidate instanceof HTMLSelectElement
    );

    if (!target) {
      return;
    }

    setNativeValue(target, domValue);
    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
  }, 150);
};

/**
 * Preenche formulário de paciente com dados fake
 */
export const fillPatientFormWithFakeData = (setValue: any, clearErrors?: any) => {
  // Pequeno delay para garantir que o DOM está pronto
  setTimeout(() => {
    // Dados Pessoais (campos flat no PatientRegister)
    setValue('nomeCompletoPaciente', faker.person.fullName());
    setValue('nomeMae', faker.person.fullName({ sex: 'female' }));
    setValue('dataNascimento', generateFakeBirthDate());
    setValue('cpfPaciente', generateFakeCPF());
    // RG no formato XX.XXX.XXX-X (9 dígitos + 1 verificador)
    const rg1 = faker.number.int({ min: 10, max: 99 });
    const rg2 = faker.number.int({ min: 100, max: 999 });
    const rg3 = faker.number.int({ min: 100, max: 999 });
    const rgDv = faker.number.int({ min: 0, max: 9 });
    setValue('rg', `${rg1}.${rg2}.${rg3}-${rgDv}`);
    setValue('naturalidade', faker.location.city());
    setValue('profissao', faker.person.jobTitle());
    setValue('telefone', generateFakePhone());
    
    // Estado Civil - usando helper
    const estadoCivil = faker.helpers.arrayElement(['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', 'UNIAO_ESTAVEL', 'SEPARADO']);
    fillSelect('estadoCivil', estadoCivil, setValue, 'estado-civil');
    
    setValue('email', faker.internet.email().toLowerCase());
    setValue('idade', faker.number.int({ min: 18, max: 90 }).toString());

    // Endereço (campos flat)
    setValue('endereco', faker.location.street());
    setValue('numero', faker.number.int({ min: 1, max: 9999 }).toString());
    setValue('complemento', faker.helpers.maybe(() => `Apto ${faker.number.int({ min: 1, max: 500 })}`, { probability: 0.5 }) || '');
    setValue('bairro', faker.location.county());
    setValue('cidade', faker.location.city());
    
    // Estado - usando helper
    const estado = faker.helpers.arrayElement(['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']);
    fillSelect('estado', estado, setValue, 'estado');
    
    setValue('cep', generateFakeCEP());

    // Dados Clínicos
    setValue('diagnostico', faker.helpers.arrayElement([
      'Diabetes Mellitus Tipo 2',
      'Hipertensão Arterial',
      'Insuficiência Cardíaca',
      'Doença Pulmonar Obstrutiva Crônica',
      'Artrite Reumatoide',
      'Alzheimer',
      'Parkinson'
    ]));
    
    // Tratamento - usando helper
    const tratamento = faker.helpers.arrayElement(['RADIOTERAPIA', 'QUIMIOTERAPIA', 'AMBOS']);
    fillSelect('tratamento', tratamento, setValue, 'tratamento');
    
    // Tipo Sanguíneo - usando helper
    const tipoSanguineo = faker.helpers.arrayElement(['A_POSITIVO', 'A_NEGATIVO', 'B_POSITIVO', 'B_NEGATIVO', 'AB_POSITIVO', 'AB_NEGATIVO', 'O_POSITIVO', 'O_NEGATIVO']);
    fillSelect('tipoSanguineo', tipoSanguineo, setValue, 'tipo-sanguineo');
    
    // Condição de Chegada - usando helper
    const condicaoChegada = faker.helpers.arrayElement(['de_ambulancia', 'maca', 'cadeira_rodas', 'nenhum']);
    fillSelect('condicaoChegada', condicaoChegada, setValue, 'condicao-chegada');
    
    // Uso de equipamentos - usando helper
    const usoCurativo = faker.helpers.arrayElement(['sim', 'nao']);
    fillSelect('usoCurativo', usoCurativo, setValue, 'uso-curativo');
    
    const usoOxigenoterapia = faker.helpers.arrayElement(['sim', 'nao']);
    fillSelect('usoOxigenoterapia', usoOxigenoterapia, setValue, 'uso-oxigenoterapia');
    
    const usoSonda = faker.helpers.arrayElement(['sim', 'nao']);
    fillSelect('usoSonda', usoSonda, setValue, 'uso-sonda');

    // Tipos de sonda - só preencher se usoSonda === 'sim'
    if (usoSonda === 'sim') {
      // Preencher aleatoriamente um dos tipos de sonda
      const tipoSonda = faker.helpers.arrayElement(['nasal', 'cirurgica', 'vesical']);
      
      if (tipoSonda === 'nasal') {
        const tipoSondaNasal = faker.helpers.arrayElement(['SNG', 'SNE', 'OROGASTRICA']);
        fillSelect('tipoSondaNasal', tipoSondaNasal, setValue, 'tipo-sonda-nasal');
        // Deixar os outros como undefined para não aparecerem no payload
        setValue('tipoSondaCirurgica', undefined, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
        setValue('tipoSondaVesical', undefined, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
        setValue('seForOutra', '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
      } else if (tipoSonda === 'cirurgica') {
        const tipoSondaCirurgica = faker.helpers.arrayElement(['G', 'J', 'GJ']);
        fillSelect('tipoSondaCirurgica', tipoSondaCirurgica, setValue, 'tipo-sonda-cirurgica');
        // Deixar os outros como undefined para não aparecerem no payload
        setValue('tipoSondaNasal', undefined, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
        setValue('tipoSondaVesical', undefined, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
        setValue('seForOutra', '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
      } else {
        const tipoSondaVesical = faker.helpers.arrayElement(['FOLEY', 'CISTOSTOMIA', 'OUTRA']);
        fillSelect('tipoSondaVesical', tipoSondaVesical, setValue, 'tipo-sonda-vesical');
        
        // Deixar os outros como undefined para não aparecerem no payload
        setValue('tipoSondaNasal', undefined, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
        setValue('tipoSondaCirurgica', undefined, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
        
        // Se for OUTRA, preencher o campo de descrição
        if (tipoSondaVesical === 'OUTRA') {
          setValue('seForOutra', 'Sonda vesical personalizada');
        } else {
          setValue('seForOutra', '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
        }
      }
    } else {
      // Se não usa sonda, garantir que todos os campos estejam undefined
      // Importante: shouldValidate: false para não disparar validação
      setValue('tipoSondaNasal', undefined, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
      setValue('tipoSondaCirurgica', undefined, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
      setValue('tipoSondaVesical', undefined, { shouldValidate: false, shouldDirty: false, shouldTouch: false });
      setValue('seForOutra', '', { shouldValidate: false, shouldDirty: false, shouldTouch: false });
      
      // Limpar erros explicitamente para campos de sonda
      if (clearErrors) {
        clearErrors(['tipoSondaNasal', 'tipoSondaCirurgica', 'tipoSondaVesical', 'seForOutra']);
      }
    }

    // Contatos de Emergência
    setValue('contatosDeEmergencia', [
      {
        nome: faker.person.fullName(),
        telefone: generateFakePhone(),
        email: faker.internet.email().toLowerCase(),
      },
      {
        nome: faker.person.fullName(),
        telefone: generateFakePhone(),
        email: faker.internet.email().toLowerCase(),
      }
    ]);

    // Informação Hospitalar
    setValue('informacaoHospitalar.nomeHospitalReferencia', faker.company.name() + ' Hospital');
    setValue('informacaoHospitalar.medicoResponsavel', `Dr(a). ${faker.person.fullName()}`);
    setValue('informacaoHospitalar.setorAla', faker.helpers.arrayElement(['Ala A', 'Ala B', 'Ala C', 'UTI']));
    setValue('informacaoHospitalar.dataInternacao', generateFakeBirthDate());

    // Dado Social
    setValue('dadoSocial.rendaFamiliar', faker.number.int({ min: 1000, max: 10000 }));
    setValue('dadoSocial.composicaoFamiliar', faker.helpers.arrayElement(['Mora sozinho', 'Mora com família', 'Mora com cônjuge']));
    setValue('dadoSocial.situacaoMoradia', faker.helpers.arrayElement(['Casa própria', 'Casa alugada', 'Casa cedida']));
    setValue('dadoSocial.necessidadesEspeciais', faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) || '');

    console.log('✅ Formulário de paciente preenchido com dados fake!');
  }, 200);
};

/**
 * Preenche formulário de acompanhante com dados fake
 */
export const fillCompanionFormWithFakeData = (setValue: any, _clearErrors?: any) => {
  // Pequeno delay para garantir que o DOM está pronto
  setTimeout(() => {
    // Dados Pessoais
    setValue('dadoPessoal.nome', faker.person.fullName());
    setValue('dadoPessoal.nomeMae', faker.person.fullName({ sex: 'female' }));
    setValue('dadoPessoal.dataNascimento', generateFakeBirthDate());
    setValue('dadoPessoal.cpf', generateFakeCPF());
    // RG no formato XX.XXX.XXX-X (9 dígitos + 1 verificador)
    const rg1 = faker.number.int({ min: 10, max: 99 });
    const rg2 = faker.number.int({ min: 100, max: 999 });
    const rg3 = faker.number.int({ min: 100, max: 999 });
    const rgDv = faker.number.int({ min: 0, max: 9 });
    setValue('dadoPessoal.rg', `${rg1}.${rg2}.${rg3}-${rgDv}`);
    setValue('dadoPessoal.naturalidade', faker.location.city());
    setValue('dadoPessoal.profissao', faker.person.jobTitle());
    setValue('dadoPessoal.telefone', generateFakePhone());
    
    // Estado Civil - usando helper
    const estadoCivil = faker.helpers.arrayElement(['SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', 'UNIAO_ESTAVEL', 'SEPARADO']);
    fillSelect('dadoPessoal.estadoCivil', estadoCivil, setValue, 'dadoPessoal.estadoCivil');

    // Endereço
    setValue('endereco.logradouro', faker.location.street());
    setValue('endereco.numero', faker.number.int({ min: 1, max: 9999 }));
    
    const complemento = faker.helpers.arrayElement([
      `Apto ${faker.number.int({ min: 1, max: 500 })}`,
      `Casa ${faker.number.int({ min: 1, max: 50 })}`,
      `Bloco ${faker.helpers.arrayElement(['A', 'B', 'C', 'D'])}`,
      'Fundos',
      ''
    ]);
    setValue('endereco.complemento', complemento);
    
    setValue('endereco.bairro', faker.location.county());
    setValue('endereco.cidade', faker.location.city());
    
    // Estado - usando helper
    const estado = faker.helpers.arrayElement([
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ]);
    fillSelect('endereco.estado', estado, setValue, 'endereco.estado');
    
    setValue('endereco.cep', generateFakeCEP());

    // Informações do Acompanhante - Parentesco - usando helper
    const parentesco = faker.helpers.arrayElement([
      'PAI', 'MAE', 'IRMAO', 'IRMA', 'FILHO', 'FILHA', 'CONJUGE', 'AMIGO', 'OUTRO'
    ]);
    fillSelect('parentesco', parentesco, setValue, 'parentesco');
    
    setValue('podeAjudarNaCozinha', faker.datatype.boolean());

    console.log('✅ Formulário de acompanhante preenchido com dados fake!');
  }, 200);
};

/**
 * Preenche formulário de usuário/profissional com dados fake
 */
const fillUserFormWithFakeData = (setValue: any) => {
  // Pequeno delay para garantir que o DOM está pronto
  setTimeout(() => {
    const tipos = ["ADMINISTRADOR", "DENTISTA", "ENFERMEIRO", "FISIOTERAPEUTA", "MEDICO", "NUTRICIONISTA", "RECEPCIONISTA", "AUDITOR"];
    const tipo = faker.helpers.arrayElement(tipos);
    const needsRegistro = ["DENTISTA", "MEDICO", "ENFERMEIRO", "FISIOTERAPEUTA", "NUTRICIONISTA"].includes(tipo);
    const needsRQE = tipo === "MEDICO";

    // Tipo - usando helper
    fillSelect('tipo', tipo, setValue, 'tipo');
    
    setValue('cpfUsuario', generateFakeCPF());
    setValue('email', faker.internet.email().toLowerCase());
    setValue('telefone', generateFakePhone());
    setValue('nomeUsuario', faker.person.fullName());
    
    // Sexo - usando helper
    const sexo = faker.helpers.arrayElement(['Masculino', 'Feminino']);
    fillSelect('sexo', sexo, setValue, 'sexo');
    
    // Campos profissionais
    if (needsRegistro) {
      setValue('registro', faker.string.numeric(6));
    }
    
    // Estado - usando helper
    const estado = faker.helpers.arrayElement([
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ]);
    fillSelect('estado', estado, setValue, 'estado');
    
    if (needsRQE) {
      setValue('rqe', faker.string.numeric(5));
    }

    // Endereço
    setValue('cep', generateFakeCEP());
    setValue('endereco', faker.location.streetAddress());
    setValue('bairro', faker.location.county());
    setValue('cidade', faker.location.city());
    setValue('numero', faker.number.int({ min: 1, max: 9999 }).toString());
    setValue('complemento', faker.helpers.arrayElement(['Apto 101', 'Casa 2', 'Bloco A', '']));

    // Perfis (geralmente ID 1, 2 ou 3)
    setValue('perfisIds', [faker.helpers.arrayElement([1, 2, 3])]);

    console.log('✅ Formulário de usuário preenchido com dados fake!');
  }, 200);
};

/**
 * Adiciona um botão flutuante na página para preencher o formulário com dados fake
};

/**
 * Adiciona botão "Preencher com dados fake" ao formulário
 * APENAS em ambiente de desenvolvimento
 */
export const addFakeDataButton = (
  formRef: HTMLFormElement | null,
  fillFunction: (setValue: any, clearErrors?: any) => void,
  setValue: any,
  clearErrors?: any
) => {
  if (process.env.NODE_ENV !== 'development') return;
  
  if (!formRef) return;

  // Verifica se o botão já existe
  if (formRef.querySelector('#fake-data-btn')) return;

  const button = document.createElement('button');
  button.id = 'fake-data-btn';
  button.type = 'button';
  button.textContent = '🎲 Preencher com dados fake';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    transition: all 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  button.onmouseover = () => {
    button.style.transform = 'translateY(-2px)';
    button.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
  };

  button.onmouseout = () => {
    button.style.transform = 'translateY(0)';
    button.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
  };

  button.onclick = () => {
    fillFunction(setValue, clearErrors);
    button.textContent = '✅ Dados fake preenchidos!';
    setTimeout(() => {
      button.textContent = '🎲 Preencher com dados fake';
    }, 2000);
  };

  document.body.appendChild(button);

  // Cleanup quando o componente desmontar
  return () => {
    const btn = document.getElementById('fake-data-btn');
    if (btn) btn.remove();
  };
};

// Exporta objeto com todas as funções
export const DevTools = {
  fillPatientFormWithFakeData,
  fillCompanionFormWithFakeData,
  fillUserFormWithFakeData,
  addFakeDataButton,
  generateFakeCPF,
  generateFakePhone,
  generateFakeBirthDate,
  generateFakeCEP,
};

export default DevTools;
