const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkCurrentState() {
  console.log('🔍 Verificando estado atual após login...')
  
  // Verificar sessões ativas
  const sessions = await prisma.session.findMany({
    include: {
      user: {
        include: {
          accounts: true,
          memberships: true
        }
      }
    }
  })
  
  console.log('📊 Sessões ativas:')
  sessions.forEach((session, index) => {
    console.log(`\n--- Sessão ${index + 1} ---`)
    console.log('Session Token:', session.sessionToken.substring(0, 10) + '...')
    console.log('User:', session.user.name, '(' + session.user.email + ')')
    console.log('Accounts:', session.user.accounts.length)
    console.log('Memberships:', session.user.memberships.length)
    console.log('Expires:', session.expires)
  })
  
  // Verificar contas Google
  const googleAccounts = await prisma.account.findMany({
    where: {
      provider: 'google'
    },
    include: {
      user: true
    }
  })
  
  console.log('\n🔗 Contas Google:')
  googleAccounts.forEach((account, index) => {
    console.log(`\n--- Conta ${index + 1} ---`)
    console.log('Provider Account ID:', account.providerAccountId)
    console.log('User:', account.user.name, '(' + account.user.email + ')')
    console.log('Has tokens:', !!account.access_token)
  })
  
  await prisma.$disconnect()
}

checkCurrentState().catch(console.error)