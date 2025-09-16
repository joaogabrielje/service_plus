# AttendanceHub - Sistema de Controle de Ponto

Sistema SaaS completo para gerenciamento de atendimentos e controle de ponto digital, desenvolvido com Next.js, TypeScript, Tailwind CSS e Prisma.

## 🚀 Funcionalidades

- **Landing Page** - Página inicial atrativa com informações do produto
- **Autenticação** - Sistema completo de login e registro com NextAuth.js
- **Dashboard** - Interface intuitiva para gerenciar atendimentos
- **Controle de Ponto** - Registro de entrada e saída com cálculo automático de horas
- **Relatórios** - Estatísticas detalhadas de presença e horas trabalhadas
- **Responsivo** - Interface adaptada para desktop e mobile

## 🛠️ Tecnologias

- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Prisma** - ORM para PostgreSQL
- **NextAuth.js** - Autenticação
- **Shadcn/ui** - Componentes de interface
- **Date-fns** - Manipulação de datas

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente no arquivo `.env`:
   \`\`\`
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   \`\`\`
4. Execute as migrações do banco: `npm run db:push`
5. Inicie o servidor de desenvolvimento: `npm run dev`

## 🗄️ Estrutura do Banco

O sistema utiliza as seguintes tabelas:

- **users** - Dados dos usuários
- **organizations** - Organizações/empresas
- **memberships** - Relacionamento usuário-organização
- **attendance** - Registros de entrada e saída

## 📱 Como Usar

1. Acesse a landing page e clique em "Começar Grátis"
2. Crie sua conta ou faça login
3. No dashboard, registre sua entrada clicando em "Agora" no campo de entrada
4. Ao final do expediente, registre sua saída
5. Visualize suas estatísticas e histórico de atendimentos

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run start` - Inicia servidor de produção
- `npm run db:generate` - Gera cliente Prisma
- `npm run db:push` - Aplica mudanças no banco
- `npm run db:studio` - Abre Prisma Studio

## 📄 Licença

Este projeto está sob a licença MIT.
