import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginClient } from '@kubb/plugin-client'

export default defineConfig({
  root: '.',
  input: {
    path: `${process.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'}-docs/websites/booking.json`,
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
    }),
  ],
})
