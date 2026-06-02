import express from 'express'
import { resolve, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const dist = resolve(__dirname, 'dist')
const port = process.env.PORT || 4173

const app = express()

// Hashed assets (JS, CSS) — cache for 1 year
app.use('/assets', express.static(join(dist, 'assets'), {
  maxAge: '1y',
  immutable: true,
}))

// Everything else (including index.html) — never cache
app.use(express.static(dist, { maxAge: 0, etag: false }))

// SPA fallback
app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.sendFile(join(dist, 'index.html'))
})

app.listen(port, () => console.log(`Serving on port ${port}`))
