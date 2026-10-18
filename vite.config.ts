import { defineConfig, type Plugin } from 'vite'

// Serves api/*.ts in `vite dev` the way Vercel serves them in production.
function devApi(): Plugin {
  return {
    name: 'dev-api',
    configureServer(server) {
      server.middlewares.use('/api/contributions', async (_req, res) => {
        const mod = await server.ssrLoadModule('/api/contributions.ts')
        const r: Response = await mod.GET()
        res.statusCode = r.status
        r.headers.forEach((v, k) => res.setHeader(k, v))
        res.end(await r.text())
      })
    },
  }
}

export default defineConfig({ plugins: [devApi()] })
