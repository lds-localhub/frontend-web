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

O `.env.example` tem também o contacto de suporte apresentado no início de sessão (`VITE_SUPPORT_EMAIL`, por omissão `suporte@localhub.test`).

## Testes de sistema

Os testes do Playwright precisam do backend a correr com a base de dados de referência (`database/repor-base-dados.sql` do backend). Os testes que entram como Administrador leem a palavra-passe da conta `ana.almeida@localhub.test` da variável `E2E_ADMIN_PASSWORD` (no CI, do secret com o mesmo nome):

```bash
E2E_ADMIN_PASSWORD=<palavra-passe> npm run test:e2e
```

## Testes unitários

Os testes unitários (Vitest, ficheiros `src/**/*.test.ts`) verificam só a lógica pura com risco: a formatação das datas sem hora e do mês e a regra da palavra-passe nova (Plano de testes do frontend web, secção 5.3). Correm no fuso dos Açores, onde uma data sem hora lida com `new Date()` mudaria de dia. Não precisam do backend:

```bash
npm run test:unit
```

Não fazem parte da pipeline: correm localmente, antes de cada push, pelo hook versionado em `.githooks/pre-push`. O Git não ativa os hooks versionados sozinho; depois de clonar o repositório, corre uma vez:

```bash
git config core.hooksPath .githooks
```

Se algum teste falhar, o push é cancelado. No Pull Request, o Revisor confirma que os testes unitários foram executados.

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
| `npm run test:unit`    | Testes unitários com o Vitest (`src/**/*.test.ts`).                                                   |
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
    layout/          moldura de todas as páginas (AppLayout, Header, AccountMenu)
    ui/              componentes genéricos
    reports/         componentes partilhados pelos relatórios do Cliente e do Prestador
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
