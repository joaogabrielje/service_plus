import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Vincular usuário a empresa
export async function POST(request: Request) {
  try {
    const { userId, orgId, role } = await request.json()
    if (!userId || !orgId || !role) {
      return NextResponse.json({ error: "Dados obrigatórios ausentes" }, { status: 400 })
    }
    // Verifica se já existe vínculo
    const exists = await prisma.membership.findUnique({ where: { userId_orgId: { userId, orgId } } })
    if (exists) {
      return NextResponse.json({ error: "Usuário já vinculado à empresa" }, { status: 400 })
    }
    const membership = await prisma.membership.create({ data: { userId, orgId, role, status: "ACTIVE" } })
    return NextResponse.json({ membership }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao vincular usuário" }, { status: 500 })
  }
}

// Listar vínculos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const orgId = searchParams.get("orgId")
    const where: any = { status: "ACTIVE" }
    if (userId) where.userId = userId
    if (orgId) where.orgId = orgId
    const memberships = await prisma.membership.findMany({
      where,
      include: { user: true, organization: true }
    })
    return NextResponse.json({ memberships })
  } catch (error) {
    return NextResponse.json({ memberships: [] }, { status: 200 })
  }
}

// Editar papel/permissão
export async function PATCH(request: Request) {
  try {
    const { userId, orgId, role, permissions, status } = await request.json()
    if (!userId || !orgId) {
      return NextResponse.json({ error: "IDs obrigatórios" }, { status: 400 })
    }
    const data: any = {}
    if (role) data.role = role
    if (permissions) data.permissions = permissions
    if (status) data.status = status
    const updated = await prisma.membership.update({
      where: { userId_orgId: { userId, orgId } },
      data
    })
    return NextResponse.json({ updated })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao editar vínculo" }, { status: 500 })
  }
}

// Exclusão lógica do vínculo
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const orgId = searchParams.get("orgId")
    if (!userId || !orgId) {
      return NextResponse.json({ error: "IDs obrigatórios" }, { status: 400 })
    }
    await prisma.membership.update({
      where: { userId_orgId: { userId, orgId } },
      data: { status: "INACTIVE" }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao desvincular" }, { status: 500 })
  }
}
