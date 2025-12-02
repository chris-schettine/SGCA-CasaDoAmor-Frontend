# SGCA - Casa do Amor (Frontend)

[![React](https://img.shields.io/badge/React-19.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF)](https://vitejs.dev/)
[![Material-UI](https://img.shields.io/badge/MUI-7.1-0081CB)](https://mui.com/)

Interface web do Sistema de Gestão da Casa do Amor (SGCA), desenvolvido para gerenciar informações de pacientes, acompanhantes, profissionais, hospedagens e agendamentos da instituição.

## 🚀 Funcionalidades Principais

### 👤 Gestão de Pacientes
- ✅ Listagem paginada com busca e filtros
- ✅ Cadastro completo de pacientes
- ✅ Edição de informações pessoais
- ✅ Visualização detalhada com todas as informações
- ✅ Prontuário médico integrado
- ✅ Histórico de hospedagens
- ✅ Validação completa de CPF, RG, telefone e CEP
- ✅ Busca automática de endereço por CEP

### 👥 Gestão de Acompanhantes
- ✅ Listagem de acompanhantes por paciente
- ✅ Cadastro vinculado ao paciente
- ✅ Edição de dados pessoais e endereço
- ✅ Visualização de informações completas
- ✅ Campo "Pode ajudar na cozinha"
- ✅ Validação de CPF, telefone e CEP
- ✅ Campo obrigatório de sexo/gênero

### 🏥 Gestão de Profissionais
- ✅ Listagem de profissionais ativos
- ✅ Cadastro de profissionais de saúde
- ✅ Edição de informações profissionais
- ✅ Visualização detalhada
- ✅ Gerenciamento de especialidades
- ✅ Registro profissional (CRM, COREN, etc.)

### 🏠 Gestão de Hospedagens
- ✅ Listagem de hospedagens ativas
- ✅ Cadastro de nova hospedagem para paciente
- ✅ Visualização de detalhes da hospedagem
- ✅ Gerenciamento de quartos
- ✅ Controle de vagas disponíveis
- ✅ Histórico de hospedagens do paciente

### 🛏️ Gestão de Quartos
- ✅ Listagem de todos os quartos
- ✅ Cadastro de novos quartos
- ✅ Edição de informações do quarto
- ✅ Visualização de ocupação
- ✅ Controle de capacidade e vagas

### 📅 Sistema de Agendamentos

#### Agendamentos de Pacientes
- ✅ Listagem de agendamentos com paginação
- ✅ Criação de novos agendamentos
- ✅ Edição de agendamentos existentes
- ✅ Visualização completa de detalhes
- ✅ Cancelamento com motivo obrigatório
- ✅ Verificação de conflitos de horário
- ✅ Seleção de profissional e tipo de serviço
- ✅ Definição de prioridade e tipo de atendimento
- ✅ Cálculo automático de duração
- ✅ Status do agendamento (Agendado, Confirmado, Cancelado, Concluído)
- ✅ Validação de data/hora

#### Agendamentos de Acompanhantes
- ✅ Listagem de agendamentos de acompanhantes
- ✅ Criação de agendamentos
- ✅ Edição e cancelamento
- ✅ Visualização de detalhes completos
- ✅ Seleção de acompanhante elegível
- ✅ Vinculação com paciente
- ✅ Todas as validações do agendamento de paciente

### 👨‍💼 Gestão de Usuários
- ✅ Listagem de usuários do sistema
- ✅ Cadastro de novos usuários
- ✅ Edição de perfil e permissões
- ✅ Ativação/desativação de contas
- ✅ Controle de funções (Admin, Profissional, Recepção)
- ✅ Gerenciamento de sessões ativas

### 🔐 Sistema de Autenticação e Segurança
- ✅ Login com JWT
- ✅ Autenticação de dois fatores (2FA)
- ✅ Recuperação de senha
- ✅ Verificação de email
- ✅ Ativação de conta
- ✅ Gerenciamento de sessões
- ✅ Conformidade com LGPD
- ✅ Termo de consentimento obrigatório
- ✅ Controle de acesso baseado em funções
- ✅ Timeout de sessão automático

### 📊 Dashboard e Relatórios
- ✅ Dashboard com métricas em tempo real
- ✅ Gráficos de ocupação
- ✅ Estatísticas de agendamentos
- ✅ Indicadores de pacientes ativos
- ✅ Log de auditoria

### 🛠️ Funcionalidades Técnicas
- ✅ Validação robusta com Zod
- ✅ Máscaras de entrada (CPF, telefone, CEP, RG)
- ✅ Busca de endereço por CEP (ViaCEP)
- ✅ Mensagens de toast personalizadas
- ✅ Confirmações de ações críticas
- ✅ Loading states e feedback visual
- ✅ Tratamento de erros da API
- ✅ Rascunhos automáticos de formulários
- ✅ Aviso de mudanças não salvas
- ✅ Paginação client-side
- ✅ Animações de transição entre rotas

## 🛠️ Tecnologias

### Core
- **React 19.1** - Biblioteca para construção de interfaces
- **TypeScript 5.8** - Superset JavaScript com tipagem estática
- **Vite 6.3** - Build tool e dev server ultrarrápido

### UI/UX
- **Material-UI 7.1** - Framework de componentes React
- **@mui/x-date-pickers** - Seletores de data/hora
- **@mui/icons-material** - Ícones do Material Design
- **React Router 7.1** - Roteamento da aplicação
- **Framer Motion** - Animações fluidas

### Formulários e Validação
- **React Hook Form 7.54** - Gerenciamento de formulários performático
- **Zod 3.24** - Validação de esquemas TypeScript-first
- **IMask** - Máscaras de entrada (CPF, telefone, CEP)

### Estado e Dados
- **Axios 1.7** - Cliente HTTP
- **React Query / TanStack Query** - Gerenciamento de estado servidor

### Utilitários
- **date-fns 4.1** - Manipulação de datas
- **React Toastify 10.0** - Notificações toast
- **ViaCEP** - API de busca de endereços

### Desenvolvimento
- **Vitest** - Framework de testes
- **ESLint** - Linter
- **Testing Library** - Testes de componentes

## 📋 Pré-requisitos

- Node.js (versão 20.0.0 ou superior)
- npm (ou yarn)

## 🔧 Instalação

1. Clone o repositório
```bash
git clone https://github.com/chris-schettine/SGCA-CasaDoAmor-Frontend.git
cd SGCA-CasaDoAmor-Frontend
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila o projeto para produção
- `npm run lint` - Executa a verificação de linting
- `npm run preview` - Visualiza a build de produção localmente

## 🏗️ Estrutura do Projeto

```
src/
├── api/                    # Configuração e serviços de API
│   ├── api.gateway.ts     # Interceptor Axios com auth
│   ├── *.service.ts       # Serviços por domínio
│   └── *.dto.ts           # TypeScript DTOs e tipos
├── components/            # Componentes reutilizáveis
│   ├── AgendamentoForm/   # Formulários de agendamento
│   ├── CompanionForm/     # Formulário de acompanhante
│   ├── PatientForm/       # Formulário de paciente
│   ├── Table/             # Tabelas especializadas
│   ├── Layout/            # Layout principal
│   ├── PageHeader/        # Cabeçalho de páginas
│   └── ...
├── contexts/              # Contextos React
│   └── AuthContext.tsx    # Autenticação e usuário
├── consent/               # Sistema LGPD
│   ├── config/            # Configuração de consentimentos
│   ├── hooks/             # Hooks de consentimento
│   ├── provider/          # Provider de contexto
│   └── store/             # Estado de consentimento
├── hooks/                 # Custom hooks
│   ├── useAgendamentos.ts
│   ├── useAcompanhantes.ts
│   ├── usePacientes.ts
│   ├── useFormDraft.ts    # Rascunhos automáticos
│   └── ...
├── pages/                 # Páginas da aplicação
│   ├── Login/
│   ├── Dashboard/
│   ├── Patients/
│   ├── PatientRegister/
│   ├── PatientEdit/
│   ├── PatientInformation/
│   ├── Companions/
│   ├── CompanionRegister/
│   ├── AgendamentosPacientes/
│   ├── AgendamentoPacienteRegister/
│   ├── AgendamentoPacienteEdit/
│   ├── AgendamentoPacienteView/
│   ├── AgendamentosAcompanhantes/
│   └── ...
├── schemas/               # Esquemas de validação Zod
│   ├── patientSchema.ts
│   ├── companionSchema.ts
│   ├── agendamentoSchema.ts
│   └── commonValidation.ts
├── utils/                 # Funções utilitárias
│   ├── formatters.ts      # Formatação de dados
│   ├── cepService.ts      # Integração ViaCEP
│   ├── toast.ts           # Toast notifications
│   └── dateCalculations.ts
└── tests/                 # Testes unitários
    └── setupTests.ts
```

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ✨ Agradecimentos

- Casa do Amor pela oportunidade de contribuir com a instituição
- Todos os contribuidores que dedicaram tempo para melhorar este projeto

## 🆕 Últimas Atualizações e Melhorias

### Sistema de Agendamentos (Dezembro 2024)
- ✅ **Módulo completo de agendamentos para pacientes e acompanhantes**
  - Criação, edição, visualização e cancelamento
  - Verificação automática de conflitos de horário
  - Suporte a agendamentos gerados automaticamente
  - Cálculo automático de duração
  - Validação de horários e datas
  - Sistema de prioridades e tipos de atendimento
  
- ✅ **Tabelas de agendamentos**
  - Paginação client-side
  - Ícones de visualização, edição e cancelamento
  - Status coloridos (Agendado, Confirmado, Cancelado, Concluído)
  - Indicador de geração automática
  
- ✅ **Integração com backend**
  - Suporte a IDs mistos (UUID strings e numéricos)
  - Formato de data compatível com Java LocalDateTime
  - Paginação server-side (page/size)
  - Tratamento robusto de erros

### Formulários e Validação
- ✅ **Campo sexo/gênero obrigatório** em acompanhantes
- ✅ **Validação de número de endereço** com conversão automática string→number
- ✅ **Máscaras aprimoradas** para CPF, telefone, RG e CEP
- ✅ **Busca automática de CEP** com preenchimento de endereço
- ✅ **Rascunhos automáticos** com persistência em localStorage

### Sistema de Autenticação e Segurança
- ✅ **JWT com refresh token** automático
- ✅ **2FA (Two-Factor Authentication)** completo
- ✅ **Gerenciamento de sessões** ativas
- ✅ **Conformidade LGPD** com sistema de consentimento versionado
- ✅ **Guards de rota** com verificação de consentimento
- ✅ **CSP (Content Security Policy)** configurado

### Melhorias Técnicas
- ✅ **Hooks customizados** para todas as entidades
- ✅ **React Query** para cache e sincronização
- ✅ **Type safety** completo com TypeScript
- ✅ **Tratamento de erros** centralizado
- ✅ **Logging** estruturado para debug
- ✅ **Testes unitários** com Vitest

### UX/UI
- ✅ **Animações suaves** com Framer Motion
- ✅ **Toast notifications** contextuais
- ✅ **Confirmações** de ações críticas (cancelamento, exclusão)
- ✅ **Loading states** em todas as operações assíncronas
- ✅ **Aviso de mudanças não salvas** ao navegar
- ✅ **Breadcrumbs** para navegação contextual

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# API Backend
VITE_API_BASE_URL=http://localhost:8090/api

# Ambiente
NODE_ENV=development
```

**Importante**: Reinicie o servidor Vite após modificar o `.env`.

## 🚦 Rotas da Aplicação

### Públicas
- `/` - Landing page
- `/login` - Autenticação
- `/login/verify-2fa` - Verificação 2FA
- `/forgot-password` - Recuperação de senha
- `/reset-password` - Redefinir senha
- `/verify-email/:token` - Verificação de email
- `/activate-account` - Ativação de conta
- `/about` - Sobre a aplicação

### Protegidas (Requerem autenticação + consentimento LGPD)

**Pacientes**
- `/patients` - Lista
- `/patient/register` - Cadastro
- `/patient/edit/:id` - Edição
- `/patient/information` - Visualização
- `/patient/information/medical-record` - Prontuário

**Acompanhantes**
- `/companions` - Lista
- `/patient/companion/register` - Cadastro
- `/companion/edit/:id` - Edição
- `/companion/information` - Visualização

**Agendamentos - Pacientes**
- `/agendamentos/pacientes` - Lista
- `/agendamentos/pacientes/novo` - Novo
- `/agendamentos/pacientes/:uuid` - Visualizar
- `/agendamentos/pacientes/:uuid/editar` - Editar

**Agendamentos - Acompanhantes**
- `/agendamentos/acompanhantes` - Lista
- `/agendamentos/acompanhantes/novo` - Novo
- `/agendamentos/acompanhantes/:uuid` - Visualizar
- `/agendamentos/acompanhantes/:uuid/editar` - Editar

**Profissionais**
- `/profissionais` - Lista
- `/profissional/register` - Cadastro
- `/profissional/edit/:uuid` - Edição
- `/profissional/information/:uuid` - Visualização

**Hospedagens**
- `/hospedagens` - Lista
- `/hospedagem/register` - Cadastro
- `/hospedagem/information` - Visualização

**Quartos**
- `/quartos` - Lista
- `/quarto/register` - Cadastro
- `/quarto/edit/:id` - Edição
- `/quarto/information/:id` - Visualização

**Administração**
- `/dashboard` - Dashboard com métricas
- `/users` - Gerenciamento de usuários
- `/user/register` - Cadastro de usuário
- `/user/edit/:id` - Edição de usuário
- `/sessions` - Sessões ativas
- `/my-profile` - Perfil do usuário
- `/audit-log` - Log de auditoria

## 🔒 Níveis de Acesso

- **Admin**: Acesso total ao sistema
- **Profissional**: Acesso a pacientes, acompanhantes e agendamentos
- **Recepção**: Acesso a cadastros e agendamentos

## 🐛 Troubleshooting

### Erro de CORS
Certifique-se que o backend está configurado para aceitar requisições do frontend:
```java
@CrossOrigin(origins = "http://localhost:5173")
```

### Erro 401 (Não autorizado)
- Verifique se o token JWT está válido
- Faça logout e login novamente
- Verifique se o backend está rodando

### Erro 500 no agendamento
- Verifique se todos os campos obrigatórios estão preenchidos
- Confirme que o formato de data está correto
- Verifique se não há conflitos de horário

### Página branca após build
- Verifique se o `vercel.json` está configurado
- Confirme que o `base` no `vite.config.ts` está correto
- Verifique o console do navegador para erros

## 📝 Padrões de Código

### Componentes
```typescript
// Sempre use TypeScript
export default function ComponentName() {
  // Hooks no topo
  const [state, setState] = useState();
  
  // Efeitos
  useEffect(() => {}, []);
  
  // Handlers
  const handleAction = () => {};
  
  // Render
  return <div>...</div>;
}
```

### Serviços API
```typescript
// api/entity.service.ts
export const entityService = {
  listar: async (page = 0, size = 20) => {
    const response = await api.get('/entities', { params: { page, size } });
    return response.data;
  },
  
  obterPorId: async (id: string) => {
    const response = await api.get(`/entities/${id}`);
    return response.data;
  },
  
  criar: async (data: CreateDTO) => {
    const response = await api.post('/entities', data);
    return response.data;
  },
};
```

### Schemas Zod
```typescript
// schemas/entitySchema.ts
export const entitySchema = z.object({
  campo: z.string().min(1, 'Campo obrigatório'),
  numero: z.number().min(0),
  opcional: z.string().optional(),
});

export type EntityFormInputs = z.infer<typeof entitySchema>;
```

## 🎯 Roadmap

- [ ] Relatórios em PDF
- [ ] Exportação de dados (Excel, CSV)
- [ ] Notificações push
- [ ] Mensageria interna
- [ ] Integração com WhatsApp
- [ ] App mobile (React Native)
- [ ] Módulo financeiro
- [ ] Agenda visual (calendário)

## 🛠️ Notas de Desenvolvimento

### Backend Esperado
- Base URL: `http://localhost:8090/api`
- Autenticação: JWT via header `Authorization: Bearer <token>`
- Paginação: Query params `?page=0&size=20`
- Formato de data: `yyyy-MM-ddTHH:mm:ss` (sem timezone)
- IDs: Suporta UUID (string) e Long (number)

### Vite Dev Server
- Porta padrão: `5173`
- Porta alternativa: `5174` (se 5173 ocupada)
- HMR habilitado
- CSP relaxado em desenvolvimento

### Deploy (Vercel)
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrites: Configurado em `vercel.json`
- Variáveis de ambiente: Configure no Vercel Dashboard