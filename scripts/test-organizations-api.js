const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testOrganizationsAPI() {
  console.log('🔍 Testando estrutura das organizações...\n')
  
  try {
    // Listar todas as organizações
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        cnpj: true,
        city: true,
        status: true,
        isDeleted: true,
        createdAt: true,
        _count: {
          select: {
            memberships: {
              where: {
                isDeleted: false,
                status: "ACTIVE"
              }
            }
          }
        }
      }
    })

    console.log(`📊 Total de organizações: ${organizations.length}\n`)

    organizations.forEach((org, index) => {
      console.log(`${index + 1}. ${org.name}`)
      console.log(`   ID: ${org.id}`)
      console.log(`   Slug: ${org.slug}`)
      console.log(`   CNPJ: ${org.cnpj || 'N/A'}`)
      console.log(`   Cidade: ${org.city || 'N/A'}`)
      console.log(`   Status: ${org.status}`)
      console.log(`   Deletada: ${org.isDeleted}`)
      console.log(`   Usuários ativos: ${org._count.memberships}`)
      console.log(`   Criada em: ${org.createdAt.toLocaleDateString('pt-BR')}`)
      console.log('')
    })

    // Verificar se há organizações ativas
    const activeOrgs = organizations.filter(org => 
      !org.isDeleted && org.status === 'ACTIVE'
    )

    console.log(`✅ Organizações ativas: ${activeOrgs.length}`)
    
    if (activeOrgs.length === 0) {
      console.log('⚠️  Nenhuma organização ativa encontrada!')
      console.log('💡 Pode ser necessário atualizar o status das organizações.')
    }

  } catch (error) {
    console.error('❌ Erro ao testar organizações:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testOrganizationsAPI()