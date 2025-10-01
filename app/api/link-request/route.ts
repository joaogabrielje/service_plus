import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Busca o usuário pelo email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const { orgId } = await req.json();
  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  // Verifica se já existe solicitação pendente
  const existing = await prisma.organizationLinkRequest.findFirst({
    where: {
      userId: user.id,
      orgId,
      status: "PENDING",
    },
  });
  if (existing) {
    return NextResponse.json({ error: "Solicitação já enviada" }, { status: 409 });
  }

  // Cria solicitação
  const linkRequest = await prisma.organizationLinkRequest.create({
    data: {
      userId: user.id,
      orgId,
      status: "PENDING",
    },
  });

  return NextResponse.json({ success: true, linkRequest });
}
