import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginClient } from '@kubb/plugin-client'
import { pluginZod } from '@kubb/plugin-zod'
import { writeFileSync } from 'node:fs'
import 'dotenv/config'

const BASE = process.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'
const TOKEN = process.env.SWAGGER_ACCESS_TOKEN ?? ''
// Build-time only — NUNCA prefixar com VITE_. Combina com a WAF custom rule na
// Cloudflare (header X-CI-Bypass => Skip Bot Fight) para a build atravessar o edge.
const CF_BYPASS = process.env.CF_BYPASS_TOKEN ?? ''

// Pré-fetch do spec com o header de bypass e escreve um ficheiro local; o Kubb lê
// o ficheiro (o suporte a headers custom no input do Kubb é limitado). O token só
// vai no header — não fica em spec*.json nem no código gerado.
async function fetchSpec(url: string, outFile: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'kubb-codegen',
      ...(CF_BYPASS ? { 'X-CI-Bypass': CF_BYPASS } : {}),
    },
  })
  if (!res.ok) {
    throw new Error(
      `Falha a obter o OpenAPI spec (${res.status} ${res.statusText}) de ${url}. ` +
        `Se for a Cloudflare a bloquear, confirma CF_BYPASS_TOKEN e a WAF rule.`,
    )
  }
  writeFileSync(outFile, await res.text())
  return outFile
}

const sharedPlugins = [
  pluginOas(),
  pluginTs(),
  pluginClient({ importPath: '@kubb/plugin-client/clients/axios' }),
  pluginZod({ output: { path: './zod' } }),
]

export default defineConfig([
  {
    root: '.',
    input: {
      path: await fetchSpec(`${BASE}-docs/websites/booking.json?key=${TOKEN}`, 'spec.booking.json'),
    },
    output: {
      path: './src/servers/booking',
      clean: true,
    },
    plugins: [
      ...sharedPlugins,
      pluginReactQuery({
        output: { path: './hooks' },
        infinite: false,
        client: { baseURL: BASE },
      }),
    ],
  },
  {
    root: '.',
    input: {
      path: await fetchSpec(`${BASE}-docs/websites/customers.json?key=${TOKEN}`, 'spec.customers.json'),
    },
    output: {
      path: './src/servers/customers',
      clean: true,
    },
    plugins: [
      ...sharedPlugins,
      pluginReactQuery({
        output: { path: './hooks' },
        infinite: false,
        client: { baseURL: BASE },
      }),
    ],
  },
  {
    root: '.',
    input: {
      path: await fetchSpec(`${BASE}-docs/websites/content.json?key=${TOKEN}`, 'spec.content.json'),
    },
    output: {
      path: './src/servers/cms',
      clean: true,
    },
    plugins: [
      ...sharedPlugins,
      pluginReactQuery({
        output: { path: './hooks' },
        infinite: false,
        client: { baseURL: BASE },
      }),
    ],
  },
])
