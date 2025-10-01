import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { email, password, orgId } = await req.json();
  if (!email || !password || !orgId) {
    return NextResponse.json({ error: "Email, senha e empresa são obrigatórios" }, { status: 400 });
  }

  // Busca usuário externo
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // Verifica senha
  if (!user.password) {
    return NextResponse.json({ error: "Senha não definida" }, { status: 400 });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return NextResponse.json({ error: "Senha inválida" }, { status: 401 });
  }

  // Verifica se já tem vínculo
  const hasMembership = await prisma.membership.findFirst({
    where: { userId: user.id, isDeleted: false, status: "ACTIVE" }
  });
  if (hasMembership) {
    return NextResponse.json({ error: "Usuário já está vinculado a uma empresa" }, { status: 409 });
  }

  // Vincula usuário à empresa do dono
  await prisma.membership.create({
    data: {
      userId: user.id,
      orgId,
      role: "USER"
    }
  });

  return NextResponse.json({ success: true });
}
