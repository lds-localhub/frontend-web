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

| Script                 | O que faz                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento do Vite, com o proxy para o backend.                                        |
| `npm run build`        | Verificação de tipos (`tsc -b`) e build de produção em `dist/`.                                         |
| `npm run preview`      | Serve o build de `dist/` localmente.                                                                    |
| `npm run lint`         | ESLint (regulamento interno, secção 10.4).                                                              |
| `npm run format`       | Formata o código com o Prettier.                                                                        |
| `npm run format:check` | Verifica a formatação sem alterar ficheiros (regulamento interno, secção 10.3).                         |
| `npm run test:e2e`     | Testes de sistema com o Playwright (`e2e/`), no Google Chrome, contra o backend real (secção seguinte). |

## Testes de sistema

Os testes de sistema (`e2e/`) correm no **Google Chrome** com viewport de **1920 × 1080 px** contra o
sistema real: frontend, backend e PostgreSQL 18. A única simulação é a do geocodificador externo
(Nominatim), substituído por um stub local (`e2e/support/nominatim-stub.ts`) com coordenadas fixas.

- **Dados:** a base de dados é criada e reposta com os scripts de referência do backend
  (`database/repor-base-dados.sql`, RNF-19), cujos dados são só de leitura para os testes. Cada teste
  cria os restantes dados pela API documentada, com os helpers de `e2e/support/api.ts` e e-mails únicos.
  Os testes não acedem diretamente à base de dados.
- **Fixtures:** os testes importam `test` e `expect` de `e2e/support/fixtures.ts`, que fornece o cliente
  `api` para o backend e regista a versão do navegador em cada teste do relatório.
- **Teste de exemplo:** `e2e/exemplo-backend.spec.ts`.

### Execução local

Usar uma base de dados própria para os testes (nunca a `localhub_dev` nem a `localhub_test`). A partir da
pasta do repositório `backend`, na versão indicada em `BACKEND_REF` no `.github/workflows/ci.yml`:

```bash
# 1. Criar ou repor a base de dados dos testes
psql -U postgres -d postgres -v dbname=localhub_e2e -f database/repor-base-dados.sql

# 2. Arrancar o geocodificador simulado (a partir da pasta do frontend-web)
node e2e/support/nominatim-stub.ts

# 3. Arrancar o backend apontado para a base dos testes e para o stub (a partir da pasta do backend)
ConnectionStrings__LocalHub="Host=localhost;Port=5432;Database=localhub_e2e;Username=localhub;Password=<palavra-passe>" \
Nominatim__BaseUrl="http://localhost:8089/" \
dotnet run --project src/LocalHub.Api

# 4. Correr os testes (a partir da pasta do frontend-web)
npm run test:e2e
```

Os testes que usam as contas da base de referência leem as palavras-passe das variáveis
`E2E_ADMIN_PASSWORD` (administrador) e `E2E_DEMO_PASSWORD` (cliente e prestador), indicadas no README dos
scripts da base de dados do backend. O relatório fica em `playwright-report/` (`npx playwright show-report`).

### Pipeline (QG-06)

O job `frontend-web` do `.github/workflows/ci.yml`, depois da construção e da análise estática, arranca o
PostgreSQL 18, cria a base com os scripts de referência, arranca o stub e o backend na versão
`BACKEND_REF`, e corre o Playwright no Google Chrome. Um teste falhado faz a pipeline falhar e bloqueia o
merge. O relatório do Playwright, a versão do Chrome e os registos do backend e do stub ficam no artefacto
`relatorio-testes-sistema-frontend-web`.

Segredos do repositório (Settings → Secrets and variables → Actions), nunca guardados no código:

| Segredo               | Uso                                                                  |
| --------------------- | -------------------------------------------------------------------- |
| `E2E_DB_PASSWORD`     | Palavra-passe do PostgreSQL da pipeline e do utilizador `localhub`.  |
| `E2E_JWT_SIGNING_KEY` | Chave de assinatura dos tokens do backend (mínimo de 32 caracteres). |
| `E2E_ADMIN_PASSWORD`  | Palavra-passe do administrador da base de referência.                |
| `E2E_DEMO_PASSWORD`   | Palavra-passe do cliente e do prestador da base de referência.       |

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
