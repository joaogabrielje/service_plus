import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Retornar informações detalhadas da sessão para debug
    const sessionData = {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: (session.user as any)?.role,
        orgId: (session.user as any)?.orgId,
        orgName: (session.user as any)?.orgName
      },
      expires: session.expires,
      rawSession: session
    }

    return NextResponse.json({ session: sessionData })
  } catch (error) {
    console.error("Error in session debug:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}