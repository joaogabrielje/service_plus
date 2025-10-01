import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (session?.user) {
      console.log('Fazendo logout do usuário:', session.user.email)
      
      // Limpar sessões do usuário no banco
      await prisma.session.deleteMany({
        where: {
          userId: (session.user as any).id
        }
      })
      
      console.log('Sessões removidas do banco')
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro no logout:', error)
    return NextResponse.json({ error: 'Erro no logout' }, { status: 500 })
  }
}