import type { FastifyInstance } from 'fastify'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../db.js'

const registerBody = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
  papel: z.enum(['ADMIN', 'TECNICO', 'VISUALIZADOR']).optional(),
})

const loginBody = z.object({
  email: z.string().email(),
  senha: z.string(),
})

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', async (request, reply) => {
    const body = registerBody.parse(request.body)

    const exists = await prisma.usuario.findUnique({ where: { email: body.email } })
    if (exists) return reply.status(409).send({ error: 'E-mail já cadastrado.' })

    const senhaHash = await bcrypt.hash(body.senha, 10)
    const usuario = await prisma.usuario.create({
      data: {
        nome: body.nome,
        email: body.email,
        senhaHash,
        papel: body.papel ?? 'TECNICO',
      },
      select: { id: true, nome: true, email: true, papel: true, createdAt: true },
    })

    const token = app.jwt.sign({ sub: usuario.id, papel: usuario.papel })
    return reply.status(201).send({ token, usuario })
  })

  app.post('/auth/login', async (request, reply) => {
    const body = loginBody.parse(request.body)

    const usuario = await prisma.usuario.findUnique({ where: { email: body.email } })
    if (!usuario) return reply.status(401).send({ error: 'Credenciais inválidas.' })

    const senhaOk = await bcrypt.compare(body.senha, usuario.senhaHash)
    if (!senhaOk) return reply.status(401).send({ error: 'Credenciais inválidas.' })

    const token = app.jwt.sign({ sub: usuario.id, papel: usuario.papel })
    return {
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel },
    }
  })

  app.get('/auth/me', {
    preHandler: [async (req, rep) => { try { await req.jwtVerify() } catch { rep.status(401).send({ error: 'Não autenticado.' }) } }],
  }, async (request) => {
    const { sub } = request.user as { sub: string }
    return prisma.usuario.findUniqueOrThrow({
      where: { id: sub },
      select: { id: true, nome: true, email: true, papel: true, createdAt: true },
    })
  })
}
