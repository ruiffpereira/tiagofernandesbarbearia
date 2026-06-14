import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginClient } from '@kubb/plugin-client'
import { pluginZod } from '@kubb/plugin-zod'
import 'dotenv/config'

const BASE = process.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'
const TOKEN = process.env.SWAGGER_ACCESS_TOKEN ?? ''

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
      path: `${BASE}-docs/websites/booking.json?key=${TOKEN}`,
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
      path: `${BASE}-docs/websites/customers.json?key=${TOKEN}`,
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
      path: `${BASE}-docs/websites/content.json?key=${TOKEN}`,
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
