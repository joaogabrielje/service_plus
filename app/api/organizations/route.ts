
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma";
import { validarCNPJ } from "@/utils/validateCnpj";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    const userOrgId = (session.user as any)?.orgId

    // Verificar se tem permissão para ver organizações
    if (userRole !== "ADMIN" && userRole !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão para ver organizações" }, { status: 403 })
    }

    let whereClause: any = {
      isDeleted: false,
      status: "ACTIVE"
    }

    if (userRole === "ADMIN" && userOrgId) {
      // Admin da empresa: vê apenas sua organização
      whereClause.id = userOrgId
    }
    // Owner vê todas as organizações (sem filtro adicional)

    const organizations = await prisma.organization.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        slug: true,
        cnpj: true,
        city: true,
        status: true,
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
      },
      orderBy: { name: 'asc' }
    })

    // Formatar dados para retorno
    const formattedOrganizations = organizations.map(org => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      cnpj: org.cnpj,
      city: org.city,
      status: org.status,
      createdAt: org.createdAt,
      userCount: org._count.memberships
    }))

    return NextResponse.json({ organizations: formattedOrganizations })
  } catch (error) {
    console.error("Error fetching organizations:", error)
    return NextResponse.json({ organizations: [] }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userRole = (session.user as any)?.role

    // Verificar se tem permissão para criar organizações
    if (userRole !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão para criar organizações" }, { status: 403 })
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const cnpj = formData.get("cnpj") as string;
    const ie = formData.get("ie") as string;
    const cep = formData.get("cep") as string;
    const address = formData.get("address") as string;
    const state = formData.get("state") as string;
    const city = formData.get("city") as string;
    const number = formData.get("number") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const primaryColor = formData.get("primaryColor") as string;
    const secondaryColor = formData.get("secondaryColor") as string;
    const slug = name ? name.toLowerCase().replace(/\s+/g, "-") : "";
    console.log('[ORG POST] Dados recebidos:', {
      name, cnpj, ie, cep, address, state, city, number, email, phone, primaryColor, secondaryColor
    });
    // logoUrl removido temporariamente
    let logoUrl = "";

    // Validação do CNPJ
    if (!validarCNPJ(cnpj)) {
      console.log('[ORG POST] CNPJ inválido:', cnpj);
      return NextResponse.json({ error: "CNPJ inválido" }, { status: 400 });
    }

    // Verificação de duplicidade
    const exists = await prisma.organization.findUnique({ where: { cnpj } });
    if (exists) {
      console.log('[ORG POST] CNPJ já cadastrado:', cnpj);
      return NextResponse.json({ error: "CNPJ já cadastrado" }, { status: 400 });
    }

    // Criação da empresa
    let org = null;
    try {
      org = await prisma.organization.create({
        data: {
          name,
          cnpj,
          ie,
          cep,
          address,
          state,
          city,
          number,
          email,
          phone,
          primaryColor,
          secondaryColor,
          logoUrl,
          slug,
        },
      });
      console.log('[ORG POST] Organização criada:', org);
    } catch (err) {
      console.log('[ORG POST] Erro ao criar organização:', err);
      return NextResponse.json({ error: "Erro ao criar organização" }, { status: 500 });
    }

    return NextResponse.json(org, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
