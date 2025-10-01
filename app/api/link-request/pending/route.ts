import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Busca todas organizações que o usuário é admin/dono
  const adminMemberships = await prisma.membership.findMany({
    where: {
      user: { email: session.user.email },
      OR: [
        { role: "ADMIN" },
        { role: "OWNER" }
      ],
      isDeleted: false,
      status: "ACTIVE"
    },
    select: { orgId: true }
  });
  const orgIds = adminMemberships.map(m => m.orgId);

  if (orgIds.length === 0) {
    return NextResponse.json({ requests: [] });
  }

  // Busca solicitações pendentes para essas organizações
  const requests = await prisma.organizationLinkRequest.findMany({
    where: {
      orgId: { in: orgIds },
      status: "PENDING"
    },
    include: {
      user: true,
      organization: true
    }
  });

  return NextResponse.json({ requests });
}
