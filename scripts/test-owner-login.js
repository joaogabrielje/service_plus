const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testOwnerLogin() {
  console.log('🔍 Verificando usuário OWNER...\n')
  
  try {
    // Buscar o usuário owner
    const owner = await prisma.user.findUnique({
      where: { email: 'owner@serviceplus.com' },
      include: {
        memberships: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!owner) {
      console.log('❌ Usuário OWNER não encontrado!')
      return
    }

    console.log('✅ Usuário OWNER encontrado:')
    console.log(`   ID: ${owner.id}`)
    console.log(`   Nome: ${owner.name}`)
    console.log(`   Email: ${owner.email}`)
    console.log(`   Memberships: ${owner.memberships.length}`)
    
    owner.memberships.forEach((membership, index) => {
      console.log(`   ${index + 1}. Org: ${membership.organization.name}`)
      console.log(`      Role: ${membership.role}`)
      console.log(`      Status: ${membership.status}`)
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testOwnerLogin()