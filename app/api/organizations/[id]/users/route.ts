import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const orgId = params.id;
    
    // Buscar memberships da organização incluindo dados do usuário
    const memberships = await prisma.membership.findMany({
      where: {
        orgId,
        isDeleted: false
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(memberships);
  } catch (error) {
    console.error("Erro ao buscar usuários da organização:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}