import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // O id do usuário está em session.user?.sub
  // Forçar tipagem para acessar id
  const userId = (session?.user as any)?.id
  const userRole = (session?.user as any)?.role
  const userOrgId = (session?.user as any)?.orgId
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Se é administrador da empresa, pode ver todos os atendimentos da empresa
    // Se é funcionário comum, vê apenas os próprios
    let whereClause: any = {}
    
    if (userRole === "ADMIN" && userOrgId) {
      // Admin da empresa: vê todos os atendimentos da sua organização
      whereClause = {
        orgId: userOrgId,
      }
    } else if (userRole === "OWNER") {
      // Owner: vê tudo (sem filtro)
      whereClause = {}
    } else {
      // Funcionário comum: vê apenas os próprios
      whereClause = {
        userId: userId,
      }
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      orderBy: {
        checkIn: "desc",
      },
      take: 100, // Aumentei o limite para admins
      include: {
        customer: true,
        supportType: true,
        user: userRole === "ADMIN" || userRole === "OWNER" ? {
          select: {
            id: true,
            name: true,
            email: true
          }
        } : false,
      },
    })

    return NextResponse.json({ attendances })
  } catch (error) {
    console.error("Error fetching attendances:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

  // Forçar tipagem para acessar id
  const userId = (session?.user as any)?.id
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

  const { checkIn, checkOut, customerId, supportTypeId, supportMode, notes } = await request.json()

    if (!checkIn) {
      return NextResponse.json({ error: "Data de entrada é obrigatória" }, { status: 400 })
    }

    // Validação de data/hora: saída deve ser posterior à entrada
    if (checkOut && checkIn) {
      const entryDateTime = new Date(checkIn)
      const exitDateTime = new Date(checkOut)
      
      if (exitDateTime <= entryDateTime) {
        return NextResponse.json({ 
          error: "A data e hora de saída deve ser posterior à data e hora de entrada" 
        }, { status: 400 })
      }
    }

    // For now, we'll use a default organization ID
    // In a real app, you'd get this from the user's membership
    const defaultOrgId = "default-org"

    // Create or find default organization
    let organization = await prisma.organization.findUnique({
      where: { slug: "default" },
    })

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: "Organização Padrão",
          slug: "default",
          cnpj: "00000000000000",
          address: "Endereço padrão",
        },
      })
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId: userId,
        orgId: organization.id,
        customerId: customerId || null,
        checkIn: new Date(checkIn),
        checkOut: checkOut ? new Date(checkOut) : null,
  supportTypeId: supportTypeId || null,
        supportMode: supportMode || null,
        notes: notes || null,
      },
    })

    // Atualiza o campo lastContactedAt do cliente
    if (attendance.customerId) {
      await prisma.customer.update({
        where: { id: attendance.customerId },
        data: { lastContactedAt: attendance.checkIn }
      })
    }

    return NextResponse.json({ attendance }, { status: 201 })
  } catch (error) {
    console.error("Error creating attendance:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
