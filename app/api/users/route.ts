import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const orgId = (session?.user as any)?.orgId;
    if (!orgId) {
      return NextResponse.json([], { status: 200 });
    }
    // Buscar apenas usuários com vínculo ativo na mesma empresa
    const memberships = await prisma.membership.findMany({
      where: {
        orgId,
        isDeleted: false,
        status: "ACTIVE"
      },
      select: { userId: true }
    });
    const userIds = memberships.map(m => m.userId);
    if (userIds.length === 0) {
      return NextResponse.json([], { status: 200 });
    }
    const users = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        status: "ACTIVE"
      }
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, password, orgId, role } = await request.json();
    if (!name || !email || !password || !orgId) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes" },
        { status: 400 }
      );
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "Usuário já existe" }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        status: "ACTIVE",
      },
    });
    await prisma.membership.create({
      data: {
        userId: user.id,
        orgId,
        role: role || "USER",
      },
    });
    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao cadastrar usuário" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, name, email, password, status } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    }
    const data: any = {};
    if (name && name.length >= 3) data.name = name;
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 12);
    if (status) data.status = status;
    const updated = await prisma.user.update({ where: { id }, data });
    const { password: _, ...userWithoutPassword } = updated;
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao editar usuário" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID não informado" }, { status: 400 });
    }
    await prisma.user.update({
      where: { id },
      data: { status: "INACTIVE" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 });
  }
}
