import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db.js'
import { authenticate } from '../middlewares/auth.js'

const amostraBody = z.object({
  fornecimentoId: z.string(),
  numeroAmostra: z.number().int().positive(),
  dataMoldagem: z.string(),
  localAplicacao: z.string().min(2),
  responsavelColeta: z.string().min(2),
  coletorId: z.string().optional(),
  observacoes: z.string().optional(),
})

export async function amostrasRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/amostras', async (request) => {
    const { fornecimentoId } = request.query as { fornecimentoId?: string }
    return prisma.amostra.findMany({
      where: fornecimentoId ? { fornecimentoId } : undefined,
      orderBy: { numeroAmostra: 'asc' },
    })
  })

  app.post('/amostras', async (request, reply) => {
    const data = amostraBody.parse(request.body)
    const amostra = await prisma.amostra.create({
      data: { ...data, dataMoldagem: new Date(data.dataMoldagem) },
    })
    return reply.status(201).send(amostra)
  })

  app.get('/amostras/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const amostra = await prisma.amostra.findUnique({ where: { id } })
    if (!amostra) return reply.status(404).send({ error: 'Amostra não encontrada.' })
    return amostra
  })

  app.put('/amostras/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = amostraBody.partial().parse(request.body)
    const parsed = {
      ...data,
      ...(data.dataMoldagem ? { dataMoldagem: new Date(data.dataMoldagem) } : {}),
    }
    try {
      return await prisma.amostra.update({ where: { id }, data: parsed })
    } catch {
      return reply.status(404).send({ error: 'Amostra não encontrada.' })
    }
  })

  app.delete('/amostras/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await prisma.amostra.delete({ where: { id } })
    return reply.status(204).send()
  })
}
