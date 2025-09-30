
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Buscar todos os usuários ativos
    const users = await prisma.user.findMany({
      where: {
        status: "ACTIVE"
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        memberships: {
          where: {
            isDeleted: false
          },
          select: {
            orgId: true,
            role: true,
            organization: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}