import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    return NextResponse.json({
      user: session.user,
      debug: {
        hasId: !!(session.user as any).id,
        hasRole: !!(session.user as any).role,
        hasOrgId: !!(session.user as any).orgId,
        role: (session.user as any).role,
        orgId: (session.user as any).orgId
      }
    })
  } catch (error) {
    console.error("Erro ao buscar sessão:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
