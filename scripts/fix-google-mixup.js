const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixGoogleAccountMixup() {
  console.log('🔧 Corrigindo vinculação incorreta de conta Google...')
  
  // 1. Remover a vinculação incorreta (sistemamicro labs vinculado ao Rogerio)
  const incorrectAccount = await prisma.account.findFirst({
    where: {
      provider: 'google',
      providerAccountId: '103838583765899437425',
      user: {
        email: 'rogeriopereiradeoliveira398@gmail.com'
      }
    }
  })
  
  if (incorrectAccount) {
    console.log('❌ Removendo vinculação incorreta:', incorrectAccount.id)
    await prisma.account.delete({
      where: { id: incorrectAccount.id }
    })
    console.log('✅ Vinculação incorreta removida!')
  }
  
  // 2. Verificar se já existe usuário com email sistemamicrolabs@gmail.com
  let sistemamicroUser = await prisma.user.findUnique({
    where: { email: 'sistemamicrolabs@gmail.com' }
  })
  
  if (!sistemamicroUser) {
    // 3. Criar usuário para sistemamicro labs
    console.log('👤 Criando usuário para sistemamicro labs...')
    sistemamicroUser = await prisma.user.create({
      data: {
        name: 'sistemamicro labs',
        email: 'sistemamicrolabs@gmail.com',
        image: 'https://lh3.googleusercontent.com/a/ACg8ocLULOtoAbq9CaChos-dd2C_Zj0KOL84FqhLHVsmSIURV858YS8=s96-c',
        emailVerified: new Date()
      }
    })
    console.log('✅ Usuário criado:', sistemamicroUser.id)
  }
  
  // 4. Criar a conta Google correta para sistemamicro labs
  console.log('🔗 Vinculando conta Google ao usuário correto...')
  await prisma.account.create({
    data: {
      userId: sistemamicroUser.id,
      type: 'oauth',
      provider: 'google',
      providerAccountId: '103838583765899437425'
    }
  })
  
  console.log('✅ Correção concluída!')
  console.log('📝 Resumo:')
  console.log(`   - Removida vinculação incorreta do Rogerio`)
  console.log(`   - Criado/encontrado usuário: ${sistemamicroUser.email}`)
  console.log(`   - Vinculada conta Google ao usuário correto`)
  
  await prisma.$disconnect()
}

fixGoogleAccountMixup().catch(console.error)