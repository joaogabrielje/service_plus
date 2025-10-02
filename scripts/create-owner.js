const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createOwner() {
  try {
    // Hash da senha padrão
    const hashedPassword = await bcrypt.hash('owner123', 12);
    
    console.log('🚀 Criando usuário OWNER...\n');
    
    // Criar usuário owner
    const ownerUser = await prisma.user.create({
      data: {
        name: 'Super Administrador',
        email: 'owner@serviceplus.com',
        password: hashedPassword,
        status: 'ACTIVE',
        emailVerified: new Date(),
      },
    });

    console.log('✅ Usuário OWNER criado com sucesso!');
    console.log('📧 Email: owner@serviceplus.com');
    console.log('🔒 Senha: owner123');
    console.log('🆔 ID:', ownerUser.id);
    console.log('👑 Role: OWNER (Super Administrador)\n');
    
    // Buscar todas as organizações para criar memberships
    const orgs = await prisma.organization.findMany();
    
    if (orgs.length > 0) {
      console.log('🏢 Criando memberships OWNER em todas as organizações:');
      
      for (const org of orgs) {
        await prisma.membership.create({
          data: {
            userId: ownerUser.id,
            orgId: org.id,
            role: 'OWNER',
            status: 'ACTIVE',
            isDeleted: false
          }
        });
        
        console.log(`   ✅ ${org.name} (${org.id})`);
      }
      
      console.log(`\n🎯 Total: ${orgs.length} membership(s) criado(s)`);
    } else {
      console.log('ℹ️  Nenhuma organização encontrada.');
      console.log('💡 O usuário OWNER foi criado, mas você precisará criar organizações primeiro.');
      console.log('📝 Ou usar o comando para criar uma organização padrão.');
    }
    
    console.log('\n🔐 CREDENCIAIS DE ACESSO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: owner@serviceplus.com');
    console.log('🔒 Senha: owner123');
    console.log('🌐 URL: http://localhost:3000/auth/login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🎉 PERMISSÕES DO OWNER:');
    console.log('• Ver dados de TODAS as empresas');
    console.log('• Gerenciar TODOS os usuários');
    console.log('• Acessar relatórios GLOBAIS');
    console.log('• Controle total do sistema');
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Erro: Email já está em uso!');
      console.log('\n💡 Opções:');
      console.log('1. Use outro email no script');
      console.log('2. Delete o usuário existente primeiro');
      console.log('3. Use o script cleanup-accounts.js para limpar');
    } else {
      console.error('❌ Erro ao criar usuário OWNER:', error.message);
      console.error('📋 Detalhes:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Função para criar organização padrão se não existir
async function createDefaultOrganization() {
  try {
    const existingOrg = await prisma.organization.findFirst();
    
    if (!existingOrg) {
      console.log('🏭 Criando organização padrão...');
      
      const defaultOrg = await prisma.organization.create({
        data: {
          name: 'ServicePlus',
          slug: 'serviceplus',
          cnpj: '00.000.000/0001-00',
          address: 'Endereço da Empresa',
          status: 'ACTIVE',
          isDeleted: false
        }
      });
      
      console.log('✅ Organização padrão criada:', defaultOrg.name);
      return defaultOrg;
    }
    
    return existingOrg;
  } catch (error) {
    console.error('❌ Erro ao criar organização:', error.message);
    return null;
  }
}

// Executar com opção de criar organização
async function main() {
  console.log('🚀 SERVICE PLUS - Criador de Super Administrador\n');
  
  // Verificar se já existe um owner
  const existingOwner = await prisma.membership.findFirst({
    where: { role: 'OWNER' },
    include: { user: true }
  });
  
  if (existingOwner) {
    console.log('⚠️  Já existe um usuário OWNER no sistema:');
    console.log(`   📧 ${existingOwner.user.email}`);
    console.log(`   👤 ${existingOwner.user.name}`);
    console.log('\n❓ Deseja continuar mesmo assim? (Ctrl+C para cancelar)');
    
    // Aguardar 3 segundos para dar chance de cancelar
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Criar organização padrão se necessário
  await createDefaultOrganization();
  
  // Criar o usuário owner
  await createOwner();
}

main().catch(console.error);