import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = (session.user as any)?.role
    const userOrgId = (session.user as any)?.orgId

    // Verificar se tem permissão para gerenciar usuários
    if (userRole !== "ADMIN" && userRole !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão para gerenciar usuários" }, { status: 403 })
    }

    let whereClause: any = {}

    if (userRole === "ADMIN" && userOrgId) {
      // Admin da empresa: vê apenas usuários da sua organização
      whereClause = {
        memberships: {
          some: {
            orgId: userOrgId,
            isDeleted: false
          }
        }
      }
    } else if (userRole === "OWNER") {
      // Owner: vê todos os usuários
      whereClause = {}
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        memberships: {
          where: {
            isDeleted: false,
            status: "ACTIVE",
            ...(userRole === "ADMIN" && userOrgId ? { orgId: userOrgId } : {})
          },
          select: {
            role: true,
            orgId: true,
            organization: {
              select: {
                name: true
              }
            }
          }
        },
        sessions: {
          orderBy: { expires: 'desc' },
          take: 1,
          select: { expires: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Formatar dados para retorno
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      createdAt: user.createdAt,
      role: user.memberships[0]?.role || "EMPLOYEE",
      organizationName: user.memberships[0]?.organization?.name,
      lastLogin: user.sessions[0]?.expires ? new Date(user.sessions[0].expires.getTime() - 30 * 24 * 60 * 60 * 1000) : null
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error) {
    console.error("Error fetching company users:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = (session.user as any)?.role
    const userOrgId = (session.user as any)?.orgId

    // Verificar se tem permissão para criar usuários
    if (userRole !== "ADMIN" && userRole !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão para criar usuários" }, { status: 403 })
    }

    const { name, email, role } = await request.json()

    // Validações
    if (!name || !email || !role) {
      return NextResponse.json({ error: "Nome, email e função são obrigatórios" }, { status: 400 })
    }

    if (!["ADMIN", "EMPLOYEE"].includes(role)) {
      return NextResponse.json({ error: "Função inválida" }, { status: 400 })
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email já está em uso" }, { status: 400 })
    }

    // Determinar orgId para o novo usuário
    let targetOrgId = userOrgId

    if (userRole === "OWNER" && !targetOrgId) {
      return NextResponse.json({ error: "Organização não especificada" }, { status: 400 })
    }

    // Gerar senha temporária
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    // Criar usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: "ACTIVE"
      }
    })

    // Criar membership
    await prisma.membership.create({
      data: {
        userId: newUser.id,
        orgId: targetOrgId,
        role,
        status: "ACTIVE",
        isDeleted: false
      }
    })

    return NextResponse.json({ 
      message: "Usuário criado com sucesso",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        tempPassword // Em produção, envie por email
      }
    })
  } catch (error) {
    console.error("Error creating company user:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}