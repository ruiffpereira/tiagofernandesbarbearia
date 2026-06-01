import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginClient } from '@kubb/plugin-client'
import 'dotenv/config'

const BASE = process.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'

export default defineConfig({
  root: '.',
  input: {
    path: `${BASE}-docs/websites/booking.json?key=${process.env.SWAGGER_ACCESS_TOKEN ?? ''}`,
  },
  output: {
    path: './src/servers/booking',
    clean: true,
  },
  plugins: [
    pluginOas(),
    pluginTs(),
    pluginClient({ importPath: '@kubb/plugin-client/clients/axios' }),
    pluginReactQuery({
      output: { path: './hooks' },
      infinite: false,
      client: {
        baseURL: BASE,
      },
    }),
  ],
})
