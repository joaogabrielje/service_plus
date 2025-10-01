export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('DELETE /api/attendances/[id] chamada');
    const session = await getServerSession(authOptions)
    console.log('session', session);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const attendanceId = params.id
    console.log('attendanceId', attendanceId);

    // Verify the attendance belongs to the user
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        userId: session.user.id,
      },
    })
    console.log('existingAttendance', existingAttendance);

    if (!existingAttendance) {
      return NextResponse.json({ error: "Atendimento não encontrado" }, { status: 404 })
    }

    // Delete attendance
    await prisma.attendance.delete({
      where: { id: attendanceId },
    })
    console.log('attendance excluído com sucesso');

    return NextResponse.json({ message: "Atendimento excluído com sucesso" })
  } catch (error) {
    console.error("Error deleting attendance:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('PUT /api/attendances/[id] chamada');
    const session = await getServerSession(authOptions)
    console.log('session', session);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { checkIn, checkOut } = await request.json()
    const attendanceId = params.id
    console.log('attendanceId', attendanceId, 'checkIn', checkIn, 'checkOut', checkOut);

    // Verify the attendance belongs to the user
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        userId: session.user.id,
      },
    })
    console.log('existingAttendance', existingAttendance);

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
    console.log('attendance atualizado', attendance);

    return NextResponse.json({ attendance })
  } catch (error) {
    console.error("Error updating attendance:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
