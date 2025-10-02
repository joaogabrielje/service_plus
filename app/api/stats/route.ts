import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = (session?.user as any)?.role
    const userOrgId = (session?.user as any)?.orgId

    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Definir filtro baseado no role
    let whereClause: any = {}
    
    if (userRole === "ADMIN" && userOrgId) {
      // Admin da empresa: stats de toda a organização
      whereClause = { orgId: userOrgId }
    } else if (userRole === "OWNER") {
      // Owner: stats de tudo
      whereClause = {}
    } else {
      // Funcionário comum: apenas próprios dados
      whereClause = { userId: userId }
    }

    // Get today's attendances
    const todayAttendances = await prisma.attendance.findMany({
      where: {
        ...whereClause,
        checkIn: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    })

    // Get this week's attendances
    const weekAttendances = await prisma.attendance.findMany({
      where: {
        ...whereClause,
        checkIn: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    })

    // Get this month's attendances
    const monthAttendances = await prisma.attendance.findMany({
      where: {
        ...whereClause,
        checkIn: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })

    // Calculate hours
    const calculateTotalHours = (attendances: any[]) => {
      return attendances.reduce((total, attendance) => {
        if (attendance.checkOut) {
          const diff = new Date(attendance.checkOut).getTime() - new Date(attendance.checkIn).getTime()
          return total + diff / (1000 * 60 * 60) // Convert to hours
        }
        return total
      }, 0)
    }

    const todayHours = calculateTotalHours(todayAttendances)
    const weekHours = calculateTotalHours(weekAttendances)
    const monthHours = calculateTotalHours(monthAttendances)

    // Calculate attendance rate (days with at least one check-in)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysWithAttendance = new Set(monthAttendances.map((a) => new Date(a.checkIn).toDateString())).size
    const attendanceRate = Math.round((daysWithAttendance / daysInMonth) * 100)

    return NextResponse.json({
      stats: {
        todayHours: Math.round(todayHours * 100) / 100,
        weekHours: Math.round(weekHours * 100) / 100,
        monthHours: Math.round(monthHours * 100) / 100,
        attendanceRate,
        daysWithAttendance,
        totalDaysInMonth: daysInMonth,
      },
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
