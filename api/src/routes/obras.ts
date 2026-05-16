import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../db.js'
import { authenticate } from '../middlewares/auth.js'

const obraBody = z.object({
  nome: z.string().min(2),
  endereco: z.string().optional(),
  responsavelTecnico: z.string().min(2),
  crea: z.string().optional(),
  cno: z.string().optional(),
  art: z.string().optional(),
  fckProjeto: z.number().min(10).max(150),
  status: z.enum(['ATIVA', 'CONCLUIDA', 'SUSPENSA']).optional(),
})

export async function obrasRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticate)

  app.get('/obras', async (request) => {
    const { sub } = request.user as { sub: string }
    return prisma.obra.findMany({
      where: { responsavelId: sub },
      orderBy: { createdAt: 'desc' },
    })
  })

  app.post('/obras', async (request, reply) => {
    const { sub } = request.user as { sub: string }
    const data = obraBody.parse(request.body)
    const obra = await prisma.obra.create({
      data: { ...data, responsavelId: sub },
    })
    return reply.status(201).send(obra)
  })

  app.get('/obras/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const obra = await prisma.obra.findUnique({ where: { id } })
    if (!obra) return reply.status(404).send({ error: 'Obra não encontrada.' })
    return obra
  })

  app.put('/obras/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const data = obraBody.partial().parse(request.body)
    try {
      return await prisma.obra.update({ where: { id }, data })
    } catch {
      return reply.status(404).send({ error: 'Obra não encontrada.' })
    }
  })

  app.delete('/obras/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    await prisma.obra.delete({ where: { id } })
    return reply.status(204).send()
  })
}
