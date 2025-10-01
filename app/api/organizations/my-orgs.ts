import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  // Recupera o usuário logado
  const session = await getServerSession(authOptions);
  // @ts-ignore
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    // Busca as empresas vinculadas ao usuário logado
    // @ts-ignore
    const memberships = await prisma.membership.findMany({
      where: { userId: session.user.id },
      include: { organization: true },
    });
    const orgs = memberships.map(m => m.organization);
    return NextResponse.json(orgs, { status: 200 });
  } catch (error) {
    return NextResponse.json([], { status: 200 });
  }
}
