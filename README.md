# LocalHub — Frontend web

Aplicação web do LocalHub (Visitante, Cliente, Prestador de Serviços e Administrador), feita com React 19, TypeScript 6 e Vite 8.

## Pré-requisitos

- Node.js 24 (versão indicada em `.nvmrc`) e npm 11.
- Backend do LocalHub a correr, por omissão em `http://localhost:5041` (ver o README do repositório `backend`).

## Instalação

```bash
npm ci
```

## Configuração

Em desenvolvimento, os pedidos a `/api` são encaminhados pelo proxy do Vite para o backend. O endereço do backend configura-se sem alterar o código:

```bash
cp .env.example .env
# editar BACKEND_URL, por exemplo BACKEND_URL=http://192.168.1.10:5041
```

Sem `.env`, é usado `http://localhost:5041`.

## Execução local

```bash
npm run dev
```

A aplicação fica disponível em `http://localhost:5173`.

## Scripts

| Script                 | O que faz                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento do Vite, com o proxy para o backend.                                      |
| `npm run build`        | Verificação de tipos (`tsc -b`) e build de produção em `dist/`.                                       |
| `npm run preview`      | Serve o build de `dist/` localmente.                                                                  |
| `npm run lint`         | ESLint (regulamento interno, secção 10.4).                                                            |
| `npm run format`       | Formata o código com o Prettier.                                                                      |
| `npm run format:check` | Verifica a formatação sem alterar ficheiros (regulamento interno, secção 10.3).                       |
| `npm run test:e2e`     | Testes de sistema com o Playwright (`e2e/`). Na primeira execução: `npx playwright install chromium`. |

## Organização das pastas

A estrutura segue o Modelo de Classes do frontend web v03:

```
src/
  main.tsx           arranque da aplicação
  api/               comunicação com o backend
  hooks/             hooks partilhados
  routes/            árvore de rotas, guardas e redirecionamento da rota /
  components/
    layout/          moldura de todas as páginas (AppLayout, Header)
    ui/              componentes genéricos
  pages/
    public/          páginas sem sessão e páginas de erro
    account/         páginas comuns aos três tipos de utilizador
    client/          páginas do Cliente
    provider/        páginas do Prestador de Serviços
    admin/           páginas do Administrador
  styles/            CSS global (tokens.css com as cores do protótipo e base.css)
  utils/             funções sem React
  assets/            imagens importadas no código
```

Os imports de outra pasta usam o alias `@/` (`src/`).
