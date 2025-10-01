import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Listar clientes
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get("org")
    const customers = await prisma.customer.findMany({
      where: {
        orgId: orgId || undefined,
        isDeleted: false,
      },
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ customers })
  } catch (error) {
    return NextResponse.json({ customers: [] }, { status: 200 })
  }
}

// Criar cliente
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    const body = await request.json()
    const {
      name, email, cpfCnpj, phone1, phone2, address, number, neighborhood, city, state, cep,
      tipoPessoa, obs, tags, preferredContact, customFields
    } = body

    // Busca o orgId do usuário logado
    const membership = await prisma.membership.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { createdAt: "desc" }
    })
    const orgId = membership?.orgId
    if (!orgId) {
      console.error("[CUSTOMER POST] Membership não encontrada para userId:", userId, "Session:", session)
    }
    if (!name || name.length < 3 || !orgId) {
      return NextResponse.json({ error: "Dados obrigatórios ausentes" }, { status: 400 })
    }
    const customer = await prisma.customer.create({
      data: {
        userId,
        orgId,
        name,
        email,
        cpfCnpj,
        phone1,
        phone2,
        address,
        number,
        neighborhood,
        city,
        state,
        cep,
        tipoPessoa,
        obs,
        tags,
        preferredContact,
        customFields,
        isDeleted: false,
        status: "ACTIVE",
      }
    })
    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao cadastrar cliente" }, { status: 500 })
  }
}

// Exclusão lógica de cliente
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID não informado" }, { status: 400 })
    }
    await prisma.customer.update({
      where: { id },
      data: {
        status: "INACTIVE"
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir cliente" }, { status: 500 })
  }
}
