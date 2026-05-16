/**
 * Seed de desenvolvimento — cria um usuário admin padrão.
 * Execute com: npm run db:seed
 */
import bcrypt from 'bcryptjs'
import { prisma } from './db.js'

async function main() {
  const email = 'admin@atterqtm.com'
  const exists = await prisma.usuario.findUnique({ where: { email } })
  if (exists) {
    console.log(`Usuário ${email} já existe. Seed ignorado.`)
    return
  }

  const usuario = await prisma.usuario.create({
    data: {
      nome: 'Administrador',
      email,
      senhaHash: await bcrypt.hash('admin123', 10),
      papel: 'ADMIN',
    },
  })
  console.log(`✅ Usuário criado: ${usuario.email} / senha: admin123`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
