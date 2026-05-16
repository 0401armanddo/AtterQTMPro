import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { authRoutes } from './routes/auth.js'
import { obrasRoutes } from './routes/obras.js'
import { fornecimentosRoutes } from './routes/fornecimentos.js'
import { amostrasRoutes } from './routes/amostras.js'
import { corposDeProvaRoutes } from './routes/corposDeProva.js'

async function bootstrap() {
  const app = Fastify({ logger: { transport: { target: 'pino-pretty' } } })

  await app.register(cors, {
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true,
  })

  await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'dev-secret-troque-em-producao',
  })

  await app.register(authRoutes)
  await app.register(obrasRoutes)
  await app.register(fornecimentosRoutes)
  await app.register(amostrasRoutes)
  await app.register(corposDeProvaRoutes)

  app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }))

  app.setErrorHandler((error: Error & { statusCode?: number }, _request, reply) => {
    if (error.name === 'ZodError') {
      return reply.status(400).send({ error: 'Dados inválidos.', details: error.message })
    }
    app.log.error(error)
    return reply.status(error.statusCode ?? 500).send({ error: error.message })
  })

  const port = Number(process.env.PORT ?? 3000)
  await app.listen({ port, host: '0.0.0.0' })
}

bootstrap().catch((err) => { console.error(err); process.exit(1) })
