import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = (session.user as any)?.role
    const userOrgId = (session.user as any)?.orgId
    const targetUserId = params.id

    // Verificar se tem permissão para gerenciar usuários
    if (userRole !== "ADMIN" && userRole !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão para gerenciar usuários" }, { status: 403 })
    }

    const { status, role } = await request.json()

    // Verificar se o usuário alvo pertence à mesma organização (se for admin)
    if (userRole === "ADMIN") {
      const targetUserMembership = await prisma.membership.findFirst({
        where: {
          userId: targetUserId,
          orgId: userOrgId,
          isDeleted: false
        }
      })

      if (!targetUserMembership) {
        return NextResponse.json({ error: "Usuário não encontrado na sua organização" }, { status: 404 })
      }
    }

    // Atualizar status do usuário se fornecido
    if (status) {
      if (!["ACTIVE", "INACTIVE"].includes(status)) {
        return NextResponse.json({ error: "Status inválido" }, { status: 400 })
      }

      await prisma.user.update({
        where: { id: targetUserId },
        data: { status }
      })
    }

    // Atualizar role se fornecido
    if (role) {
      if (!["ADMIN", "EMPLOYEE"].includes(role)) {
        return NextResponse.json({ error: "Função inválida" }, { status: 400 })
      }

      const whereClause = userRole === "ADMIN" 
        ? { userId: targetUserId, orgId: userOrgId, isDeleted: false }
        : { userId: targetUserId, isDeleted: false }

      await prisma.membership.updateMany({
        where: whereClause,
        data: { role }
      })
    }

    return NextResponse.json({ message: "Usuário atualizado com sucesso" })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = (session.user as any)?.role
    const userOrgId = (session.user as any)?.orgId
    const targetUserId = params.id

    // Verificar se tem permissão para gerenciar usuários
    if (userRole !== "ADMIN" && userRole !== "OWNER") {
      return NextResponse.json({ error: "Sem permissão para gerenciar usuários" }, { status: 403 })
    }

    // Não permitir auto-exclusão
    if (userId === targetUserId) {
      return NextResponse.json({ error: "Não é possível excluir seu próprio usuário" }, { status: 400 })
    }

    // Verificar se o usuário alvo pertence à mesma organização (se for admin)
    if (userRole === "ADMIN") {
      const targetUserMembership = await prisma.membership.findFirst({
        where: {
          userId: targetUserId,
          orgId: userOrgId,
          isDeleted: false
        }
      })

      if (!targetUserMembership) {
        return NextResponse.json({ error: "Usuário não encontrado na sua organização" }, { status: 404 })
      }

      // Marcar membership como deletado em vez de deletar o usuário
      await prisma.membership.updateMany({
        where: {
          userId: targetUserId,
          orgId: userOrgId
        },
        data: {
          isDeleted: true,
          status: "INACTIVE"
        }
      })
    } else if (userRole === "OWNER") {
      // Owner pode desativar o usuário completamente
      await prisma.user.update({
        where: { id: targetUserId },
        data: { status: "INACTIVE" }
      })

      await prisma.membership.updateMany({
        where: { userId: targetUserId },
        data: {
          isDeleted: true,
          status: "INACTIVE"
        }
      })
    }

    return NextResponse.json({ message: "Usuário removido com sucesso" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}