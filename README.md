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