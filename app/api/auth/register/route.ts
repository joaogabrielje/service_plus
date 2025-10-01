import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, orgId, role } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Usuário já existe com este email" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // Só vincula membership se orgId for enviado
    if (orgId) {
      await prisma.membership.create({
        data: {
          userId: user.id,
          orgId,
          role: role || "USER"
        }
      })
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ message: "Usuário criado com sucesso", user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
