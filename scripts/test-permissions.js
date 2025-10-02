const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPermissions() {
  console.log('🔍 Testando permissões de gestão de empresas...\n')
  
  try {
    // Buscar usuários de diferentes roles
    const users = await prisma.user.findMany({
      include: {
        memberships: {
          include: {
            organization: true
          }
        }
      },
      take: 10
    })

    console.log('📊 Usuários encontrados:', users.length)
    console.log()

    users.forEach((user, index) => {
      const membership = user.memberships[0] // Primeira membership
      if (membership) {
        console.log(`${index + 1}. ${user.name}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Role: ${membership.role}`)
        console.log(`   Organização: ${membership.organization.name}`)
        console.log(`   Pode gerenciar empresas: ${membership.role === 'OWNER' ? '✅ SIM' : '❌ NÃO'}`)
        console.log()
      }
    })

    // Contar por role
    const roleCounts = await prisma.membership.groupBy({
      by: ['role'],
      _count: {
        role: true
      },
      where: {
        isDeleted: false,
        status: 'ACTIVE'
      }
    })

    console.log('📈 Contagem por Role:')
    roleCounts.forEach(role => {
      console.log(`   ${role.role}: ${role._count.role} usuários`)
    })

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPermissions()