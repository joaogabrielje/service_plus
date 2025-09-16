import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { checkIn, checkOut } = await request.json()
    const attendanceId = params.id

    // Verify the attendance belongs to the user
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        userId: session.user.id,
      },
    })

    if (!existingAttendance) {
      return NextResponse.json({ error: "Atendimento não encontrado" }, { status: 404 })
    }

    // Update attendance
    const attendance = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        checkIn: checkIn ? new Date(checkIn) : existingAttendance.checkIn,
        checkOut: checkOut ? new Date(checkOut) : null,
      },
    })

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error("Error updating attendance:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const attendanceId = params.id

    // Verify the attendance belongs to the user
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        userId: session.user.id,
      },
    })

    if (!existingAttendance) {
      return NextResponse.json({ error: "Atendimento não encontrado" }, { status: 404 })
    }

    // Delete attendance
    await prisma.attendance.delete({
      where: { id: attendanceId },
    })

    return NextResponse.json({ message: "Atendimento excluído com sucesso" })
  } catch (error) {
    console.error("Error deleting attendance:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
