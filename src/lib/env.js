// Superfície única das envs de build (VITE_*). Sem default silencioso: env em falta falha alto
// (docs/ARMADILHAS.md). O vite.config.js valida as mesmas no build; isto cobre o dev e o arranque.
function required(name, value) {
  if (!value || !String(value).trim()) {
    throw new Error(`Env em falta no build: ${name}. Define-a no .env (dev) ou no Coolify (produção).`)
  }
  return String(value).trim()
}

export const API_BASE_URL = required('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, '')
export const SITE_TOKEN = required('VITE_SITE_TOKEN', import.meta.env.VITE_SITE_TOKEN)
