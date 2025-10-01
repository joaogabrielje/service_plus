const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugGoogleCallback() {
  console.log('🔍 Debugando callback do Google...')
  
  // Verificar se as tabelas NextAuth existem
  try {
    const accounts = await prisma.account.count()
    const sessions = await prisma.session.count()
    const verificationTokens = await prisma.verificationToken.count()
    
    console.log('📊 Contadores das tabelas NextAuth:')
    console.log(`   Accounts: ${accounts}`)
    console.log(`   Sessions: ${sessions}`)  
    console.log(`   VerificationTokens: ${verificationTokens}`)
    
    // Verificar se há erros de schema
    const testAccount = await prisma.account.findFirst()
    console.log('✅ Schema parece estar correto')
    
  } catch (error) {
    console.error('❌ Erro no schema NextAuth:', error)
  }
  
  await prisma.$disconnect()
}

debugGoogleCallback().catch(console.error)