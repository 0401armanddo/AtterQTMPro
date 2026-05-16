import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db.js'
import { authenticate } from '../middlewares/auth.js'

const fornBody = z.object({
  obraId: z.string(),
  notaFiscal: z.string().optional(),
  dataConcretagem: z.string(),
  volumeM3: z.number().positive(),
  fckProjeto: z.number().min(10).max(150),
  classeAbatimento: z.string().optional(),
  brita: z.string().optional(),
  cimento: z.string().optional(),
  centraConcretagem: z.string().optional(),
  slumpMedidoMm: z.number().optional(),
  slumpEspecificadoMm: z.number().optional(),
  temperaturaConcC: z.number().optional(),
  temperaturaAmbC: z.number().optional(),
  massaEspecifica: z.number().optional(),
  teorAr: z.number().optional(),
  observacoes: z.string().optional(),
})

export async function fornecimentosRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/fornecimentos', async (request) => {
    const { obraId } = request.query as { obraId?: string }
    return prisma.fornecimento.findMany({
      where: obraId ? { obraId } : undefined,
      orderBy: { dataConcretagem: 'desc' },
    })
  })

  app.post('/fornecimentos', async (request, reply) => {
    const data = fornBody.parse(request.body)
    const forn = await prisma.fornecimento.create({
      data: { ...data, dataConcretagem: new Date(data.dataConcretagem) },
    })
    return reply.status(201).send(forn)
  })

  app.get('/fornecimentos/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const forn = await prisma.fornecimento.findUnique({ where: { id } })
    if (!forn) return reply.status(404).send({ error: 'Fornecimento não encontrado.' })
    return forn
  })

  app.put('/fornecimentos/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = fornBody.partial().parse(request.body)
    const parsed = {
      ...data,
      ...(data.dataConcretagem ? { dataConcretagem: new Date(data.dataConcretagem) } : {}),
    }
    try {
      return await prisma.fornecimento.update({ where: { id }, data: parsed })
    } catch {
      return reply.status(404).send({ error: 'Fornecimento não encontrado.' })
    }
  })

  app.delete('/fornecimentos/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await prisma.fornecimento.delete({ where: { id } })
    return reply.status(204).send()
  })
}
