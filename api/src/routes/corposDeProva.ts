import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db.js'
import { authenticate } from '../middlewares/auth.js'

const cpBody = z.object({
  amostraId: z.string(),
  identificacao: z.string(),
  idadeEnsaioDias: z.number().int().positive(),
  diametroMm: z.number().optional(),
  alturaMm: z.number().optional(),
  massaG: z.number().optional(),
  dataEnsaio: z.string().optional(),
  cargaRupturaKn: z.number().optional(),
  resistenciaMpa: z.number().optional(),
  tipoFratura: z.enum(['TIPO_I','TIPO_II','TIPO_III','TIPO_IV','TIPO_V','TIPO_VI']).optional(),
  status: z.enum(['PENDENTE','ENSAIADO','REJEITADO']).optional(),
  observacoes: z.string().optional(),
})

export async function corposDeProvaRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/corpos-de-prova', async (request) => {
    const { amostraId } = request.query as { amostraId?: string }
    return prisma.corpoDeProva.findMany({
      where: amostraId ? { amostraId } : undefined,
      orderBy: { createdAt: 'asc' },
    })
  })

  app.post('/corpos-de-prova', async (request, reply) => {
    const data = cpBody.parse(request.body)
    const cp = await prisma.corpoDeProva.create({
      data: {
        ...data,
        status: data.status ?? 'PENDENTE',
        ...(data.dataEnsaio ? { dataEnsaio: new Date(data.dataEnsaio) } : {}),
      },
    })
    return reply.status(201).send(cp)
  })

  app.get('/corpos-de-prova/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const cp = await prisma.corpoDeProva.findUnique({ where: { id } })
    if (!cp) return reply.status(404).send({ error: 'CP não encontrado.' })
    return cp
  })

  app.put('/corpos-de-prova/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = cpBody.partial().parse(request.body)
    const parsed = {
      ...data,
      ...(data.dataEnsaio ? { dataEnsaio: new Date(data.dataEnsaio) } : {}),
    }
    try {
      return await prisma.corpoDeProva.update({ where: { id }, data: parsed })
    } catch {
      return reply.status(404).send({ error: 'CP não encontrado.' })
    }
  })

  app.delete('/corpos-de-prova/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await prisma.corpoDeProva.delete({ where: { id } })
    return reply.status(204).send()
  })
}
