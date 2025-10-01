const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanupSessions() {
  console.log('🧹 Limpando sessões antigas...')
  
  // Remover todas as sessões
  const deletedSessions = await prisma.session.deleteMany({})
  console.log(`✅ Removidas ${deletedSessions.count} sessões`)
  
  // Remover verification tokens antigos
  const deletedTokens = await prisma.verificationToken.deleteMany({
    where: {
      expires: {
        lt: new Date()
      }
    }
  })
  console.log(`✅ Removidos ${deletedTokens.count} verification tokens expirados`)
  
  console.log('🔄 Limpeza concluída. Tente fazer login novamente.')
  
  await prisma.$disconnect()
}

cleanupSessions().catch(console.error)