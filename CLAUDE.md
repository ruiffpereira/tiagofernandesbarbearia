# CLAUDE.md — tifas-barber

Site **externo** de marcações da **Barbearia Tiago Fernandes** (Braga). Não tem backend próprio: serviços, horários,
marcações, clientes, textos (CMS) e estatísticas vêm da API central (`API-FullStack`), identificado pelo **site
token** do tenant. Repo Git independente. Contexto geral, regra cross-repo e regras de negócio:
[`../CLAUDE.md`](../CLAUDE.md) · produção/secrets: [`../docs/INFRA.md`](../docs/INFRA.md).

## Stack
React 18 + Vite + Tailwind (JS/JSX; `.ts` só em `formSchemas.ts` e no código gerado) · React Query · react-router 7 ·
PWA (`vite-plugin-pwa`) · servido por `server.js` (Express, `dist/`, SPA fallback) / `nginx.conf`. Gestor: **pnpm**.

## Envs (build-time, `VITE_*`)
`VITE_API_BASE_URL` · `VITE_SITE_TOKEN` — mesmo nome que no Coolify, GitHub e nos outros repos. Só para o Kubb (nunca
`VITE_`): `SWAGGER_ACCESS_TOKEN`, `CF_BYPASS_TOKEN` (opcional). Valores só no Coolify/`.env` local — nunca commitar.
Estatísticas (Umami): o id vem da API pelo site token, sem config no site.

## Contrato (Kubb)
`kubb.config.ts` gera `src/servers/{booking,customers,cms,analytics}` a partir de `spec.*.json` (gitignored, tal como
`src/servers`). Tipos/hooks **gerados, nunca à mão**. `pnpm kubb` busca à API viva; `KUBB_OFFLINE=1 pnpm kubb` lê os
`spec.*.json` locais (gerados pelo `dumpSpec.ts` da API). `pnpm build` corre `kubb generate` primeiro. Gates:
`pnpm type-check` e `pnpm build`.

## Cliente HTTP
`src/lib/axiosClient.js` manda `X-Site-Token` em **todos** os pedidos, `withCredentials`, `Authorization: Bearer` fora
dos endpoints de auth, e faz refresh (CSRF + cookie) num 401, com 1 retry. Sem site token válido, login/registo/esqueci
dão 401 `SITE_TOKEN_REQUIRED` (CT-16). Mudar a auth do cliente = mexer neste ficheiro, não em cada chamada.

## Funcionalidades da API que usa
Login/registo/esqueci e **"Continuar com Google"** (fluxo real: `src/lib/googleLogin.js` → `/entrar/google` →
`GoogleReturnPage`; o botão só aparece se `GET …/google/enabled` disser que está ligado) · conta do cliente
(`DashboardPage`: marcações, histórico, editar, cancelar; cancelar por link `/cancelar/:token`) · marcação em passos
com o passo **"Com quem?"** (profissionais que fazem o serviço; lista vazia ⇒ passo salta) · **chat/mensagens**
(`ChatWidget`) e **push** (`lib/push.js`, VAPID da API) · newsletter **"Quero receber novidades"**
(`NewsletterConsent`, texto de consentimento enviado; gerível no Dashboard) · textos pelo CMS multi-idioma
(`cms-translations.csv`, `cms-novas-chaves.csv`) · calendário (.ics) · cookies · estatísticas Umami.
`src/data.js`/`storage.js` são resíduos de exemplo: a verdade é a API.

## Deploy
`.github/workflows/deploy.yml` (push na `main`, se `vars.DEPLOY_ENABLED == 'true'`): WireGuard (peer `ci-sites`,
secret `WIREGUARD_CONFIG`) → webhook do Coolify (`COOLIFY_DEPLOY_HOOK`, `COOLIFY_TOKEN`) → acompanha o deploy até
`finished` (log se falhar) → confirma `SITE_URL` (variable, opcional). Domínios e apps: `../docs/INFRA.md`.
Ordem: **API primeiro, site depois**. Commit ⇒ push na `main` do dono; não mexer em produção daqui.
