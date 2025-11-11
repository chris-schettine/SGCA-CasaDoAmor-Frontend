# SGCA - Casa do Amor (Frontend)

[![React](https://img.shields.io/badge/React-19.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF)](https://vitejs.dev/)
[![Material-UI](https://img.shields.io/badge/MUI-7.1-0081CB)](https://mui.com/)

Interface web do Sistema de Gestão da Casa do Amor (SGCA), desenvolvido para gerenciar informações de pacientes e acompanhantes da instituição.

## 🚀 Funcionalidades

- ✅ Gerenciamento de Pacientes
- 👥 Cadastro de Acompanhantes
- 🔒 Sistema de Autenticação
- 📋 Prontuário Médico
- 👤 Gerenciamento de Usuários
- 📝 Validação de Formulários com Zod

## 🛠️ Tecnologias

- **React** - Biblioteca para construção de interfaces
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e dev server
- **Material-UI** - Framework de componentes React
- **React Router** - Roteamento da aplicação
- **Axios** - Cliente HTTP
- **Zod** - Validação de esquemas
- **React Hook Form** - Gerenciamento de formulários

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
├── api/          # Configuração e serviços de API
├── components/   # Componentes reutilizáveis
├── contexts/     # Contextos React
├── hooks/        # Custom hooks
├── pages/        # Componentes de página
├── schemas/      # Esquemas de validação
└── utils/        # Funções utilitárias
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

## 🆕 Novas funcionalidades e melhorias (últimas alterações)

As mudanças recentes trazem funcionalidades e refatorações importantes para autenticação, consumo de API e usabilidade durante o desenvolvimento. Principais pontos adicionados até o momento:

- 🔐 Gestão de autenticação e tokens
	- Implementado gerenciamento de tokens e tratamento de erros no `apiGateway` e no `AuthContext`.
	- Melhor tratamento de respostas de login e mensagens de erro para o usuário.

- 🧭 Serviço de Pacientes (refactor)
	- Substituído `apiGateway` por um serviço focado (`pessoaFisicaService`) para manipular dados de pacientes (CRUD).
	- Refatoração do gerenciamento de pacientes para consumir a nova API e suporte à edição de paciente.

- 🔁 SPA & Deploy
	- Adicionado `vercel.json` com rewrite para direcionar todas as rotas para `index.html` (suporte ao React Router em produção no Vercel).

- 🛡️ Content Security Policy (desenvolvimento)
	- Configurações de CSP e headers de segurança adicionadas no `vite.config.ts` para proteger contra clickjacking e sniffing durante o desenvolvimento.
	- CSP relaxada em modo dev para permitir HMR (várias portas localhost). Em produção, recomenda-se usar uma política mais restrita.

- 🧾 Usuários e permissões
	- Página de edição de usuário e rota de administração adicionadas.
	- Filtros por função do usuário (ex.: profissionais) adicionados nas listagens.

- 🔐 2FA e gerenciamento de sessões
	- Implementado suporte inicial a 2FA (páginas de login/perfil) e página de gerenciamento de sessões.

- ✅ Testes e qualidade
	- Adicionados testes unitários para `Login` e `PrivateRoute`.

- 🐞 Ajustes de robustez
	- Correções na criação/edição de usuário e normalização de respostas de API (evita crashes quando o backend retorna envelopes paginados em vez de arrays).

## 🛠️ Notas de desenvolvimento importantes

- Variável de ambiente para API: `VITE_API_BASE_URL` (ex.: `http://144.22.182.60:8888`). Certifique-se de reiniciar o servidor Vite após editar o `.env`.
- Vite pode escolher uma porta diferente (ex.: `5174`) se a padrão (`5173`) estiver ocupada; o CSP de desenvolvimento já foi ajustado para permitir HMR em portas locais comuns.
- Para deploy no Vercel, confirme que `vercel.json` está no root do projeto e que a build gera os arquivos estáticos esperados.

Se quiser, eu posso gerar uma seção de changelog mais detalhada (por data e autor) a partir dos commits recentes ou extrair os diffs relevantes para cada funcionalidade listada.