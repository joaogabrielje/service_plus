import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get("orgId")
    const types = await prisma.supportType.findMany({
      where: { status: "ACTIVE", isDeleted: false, orgId: orgId || undefined },
      orderBy: { name: "asc" },
    })
    return NextResponse.json({ types })
  } catch (error) {
    return NextResponse.json({ types: [] }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, orgId } = await request.json()
    if (!name || name.length < 3 || !orgId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }
    const exists = await prisma.supportType.findFirst({ where: { name, orgId, isDeleted: false } })
    if (exists) {
      return NextResponse.json({ error: "Tipo já existe" }, { status: 400 })
    }
    const type = await prisma.supportType.create({ data: { name, orgId, status: "ACTIVE", isDeleted: false } })
    return NextResponse.json({ type }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar tipo" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, name, status } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 })
    }
    const data: any = {}
    if (name && name.length >= 3) data.name = name
    if (status) data.status = status
    const updated = await prisma.supportType.update({ where: { id }, data })
    return NextResponse.json({ updated })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao editar tipo" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID não informado" }, { status: 400 })
    }
    await prisma.supportType.update({
      where: { id },
      data: { isDeleted: true, status: "INACTIVE" },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir tipo" }, { status: 500 })
  }
}
