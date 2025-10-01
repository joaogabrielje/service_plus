const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function investigateGoogleAccount() {
  console.log('🔍 Investigando conta Google...')
  
  // Buscar conta Google com esse providerAccountId
  const account = await prisma.account.findFirst({
    where: {
      provider: 'google',
      providerAccountId: '103838583765899437425'
    },
    include: {
      user: {
        include: {
          memberships: true
        }
      }
    }
  })
  
  console.log('📋 Conta encontrada:', JSON.stringify(account, null, 2))
  
  // Buscar usuário pelo email do Google
  const userByEmail = await prisma.user.findUnique({
    where: {
      email: 'sistemamicrolabs@gmail.com'
    },
    include: {
      accounts: true,
      memberships: true
    }
  })
  
  console.log('👤 Usuário por email:', JSON.stringify(userByEmail, null, 2))
  
  // Buscar todas as contas Google
  const allGoogleAccounts = await prisma.account.findMany({
    where: {
      provider: 'google'
    },
    include: {
      user: true
    }
  })
  
  console.log('🔗 Todas as contas Google:', JSON.stringify(allGoogleAccounts, null, 2))
  
  await prisma.$disconnect()
}

investigateGoogleAccount().catch(console.error)