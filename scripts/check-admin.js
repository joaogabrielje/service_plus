const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@serviceplus.com' },
      include: {
        memberships: {
          include: {
            organization: true
          }
        }
      }
    });

    if (adminUser) {
      console.log('👤 Usuário Admin encontrado:');
      console.log('  📧 Email:', adminUser.email);
      console.log('  👤 Nome:', adminUser.name);
      console.log('  🆔 ID:', adminUser.id);
      console.log('  📅 Criado em:', adminUser.createdAt);
      
      console.log('\n🏢 Memberships:');
      adminUser.memberships.forEach((membership, index) => {
        console.log(`  ${index + 1}. Organização: ${membership.organization.name}`);
        console.log(`     🎭 Role: ${membership.role}`);
        console.log(`     📊 Status: ${membership.status}`);
        console.log(`     🗑️ Deletado: ${membership.isDeleted}`);
        console.log('');
      });
    } else {
      console.log('❌ Usuário admin não encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar usuário admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();