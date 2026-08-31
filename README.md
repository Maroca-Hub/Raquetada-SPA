# Raquetada SPA

SPA da plataforma de gamificação de padel. Consome a Raquetada API; login via Keycloak (Authorization Code + PKCE).

## Stack

Vite + React + TypeScript, `react-router-dom` para as rotas e `react-oidc-context` / `oidc-client-ts` para o Keycloak. Sem lib de estado ou de UI — Context + hooks e `fetch`.

## Como rodar

Requisitos: **Node 20+**.

```bash
cp .env.example .env
npm install
npm run dev
```

Roda em `http://localhost:3000` (porta fixa, casa com o redirect `http://localhost:3000/*` do client `raquetada-web` no Keycloak).

Aponte `VITE_API_URL` para a Raquetada API (`http://localhost:8080` local).

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — ESLint
- `npm run preview` — serve o build
