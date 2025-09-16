import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        checkIn: "desc",
      },
      take: 50, // Limit to last 50 records
    })

    return NextResponse.json({ attendances })
  } catch (error) {
    console.error("Error fetching attendances:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { checkIn, checkOut } = await request.json()

    if (!checkIn) {
      return NextResponse.json({ error: "Data de entrada é obrigatória" }, { status: 400 })
    }

    // For now, we'll use a default organization ID
    // In a real app, you'd get this from the user's membership
    const defaultOrgId = "default-org"

    // Create or find default organization
    let organization = await prisma.organization.findUnique({
      where: { slug: "default" },
    })

    if (!organization) {
      organization = await prisma.organization.create({
        data: {
          name: "Organização Padrão",
          slug: "default",
        },
      })
    }

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId: session.user.id,
        orgId: organization.id,
        checkIn: new Date(checkIn),
        checkOut: checkOut ? new Date(checkOut) : null,
      },
    })

    return NextResponse.json({ attendance }, { status: 201 })
  } catch (error) {
    console.error("Error creating attendance:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
