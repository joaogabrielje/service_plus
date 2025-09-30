const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Hash da senha padrão
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Criar usuário admin
    const adminUser = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@serviceplus.com',
        password: hashedPassword,
        status: 'ACTIVE',
        emailVerified: new Date(),
      },
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📧 Email: admin@serviceplus.com');
    console.log('🔒 Senha: admin123');
    console.log('🆔 ID:', adminUser.id);
    
    // Verificar se existe alguma organização para criar membership
    const orgs = await prisma.organization.findMany({
      take: 1
    });
    
    if (orgs.length > 0) {
      // Criar membership como ADMIN na primeira organização
      await prisma.membership.create({
        data: {
          userId: adminUser.id,
          orgId: orgs[0].id,
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });
      
      console.log('✅ Membership admin criado na organização:', orgs[0].name);
    } else {
      console.log('ℹ️  Nenhuma organização encontrada. O usuário foi criado mas sem membership.');
      console.log('💡 Crie uma organização primeiro ou adicione o membership manualmente.');
    }
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Usuário admin já existe com este email!');
      
      // Buscar o usuário existente
      const existingUser = await prisma.user.findUnique({
        where: { email: 'admin@serviceplus.com' },
        include: {
          memberships: {
            include: {
              organization: true
            }
          }
        }
      });
      
      if (existingUser) {
        console.log('📧 Email: admin@serviceplus.com');
        console.log('🆔 ID:', existingUser.id);
        console.log('👥 Organizações:', existingUser.memberships.map(m => m.organization.name));
      }
    } else {
      console.error('❌ Erro ao criar usuário admin:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();