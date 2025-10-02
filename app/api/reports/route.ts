import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, format } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type')

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const userRole = (session?.user as any)?.role
    const userOrgId = (session?.user as any)?.orgId
    const now = new Date()

    switch (reportType) {
      case 'productivity':
        return await getProductivityReport(userId, now, userRole, userOrgId)
      case 'customers':
        return await getCustomerAnalysis(userId, now, userRole, userOrgId)
      case 'kpi':
        return await getKPIData(userId, now, userRole, userOrgId)
      default:
        return NextResponse.json({ error: "Tipo de relatório não especificado" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

async function getProductivityReport(userId: string, now: Date, userRole?: string, userOrgId?: string) {
  // Definir filtro baseado no role
  let baseWhereClause: any = {}
  
  if (userRole === "ADMIN" && userOrgId) {
    baseWhereClause = { orgId: userOrgId }
  } else if (userRole === "OWNER") {
    baseWhereClause = {}
  } else {
    baseWhereClause = { userId }
  }

  // Últimos 6 meses de dados
  const months = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i)
    const monthStart = startOfMonth(monthDate)
    const monthEnd = endOfMonth(monthDate)
    
    const attendances = await prisma.attendance.findMany({
      where: {
        ...baseWhereClause,
        checkIn: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    })

    const totalHours = attendances.reduce((total, attendance) => {
      if (attendance.checkOut) {
        const diff = new Date(attendance.checkOut).getTime() - new Date(attendance.checkIn).getTime()
        return total + diff / (1000 * 60 * 60) // Convert to hours
      }
      return total
    }, 0)

    months.push({
      month: format(monthDate, 'MMM yyyy'),
      hours: Math.round(totalHours * 100) / 100,
      attendances: attendances.length,
      avgHoursPerDay: attendances.length > 0 ? Math.round((totalHours / attendances.length) * 100) / 100 : 0
    })
  }

  // Dados da semana atual vs semana anterior
  const thisWeekStart = startOfWeek(now)
  const thisWeekEnd = endOfWeek(now)
  const lastWeekStart = startOfWeek(subMonths(now, 0))
  const lastWeekEnd = endOfWeek(subMonths(now, 0))

  const thisWeekAttendances = await prisma.attendance.findMany({
    where: {
      userId,
      checkIn: { gte: thisWeekStart, lte: thisWeekEnd },
    },
  })

  const lastWeekAttendances = await prisma.attendance.findMany({
    where: {
      userId,
      checkIn: { gte: subMonths(thisWeekStart, 0), lte: subMonths(thisWeekEnd, 0) },
    },
  })

  const calculateHours = (attendances: any[]) => 
    attendances.reduce((total, att) => {
      if (att.checkOut) {
        return total + (new Date(att.checkOut).getTime() - new Date(att.checkIn).getTime()) / (1000 * 60 * 60)
      }
      return total
    }, 0)

  return NextResponse.json({
    monthlyData: months,
    weekComparison: {
      thisWeek: Math.round(calculateHours(thisWeekAttendances) * 100) / 100,
      lastWeek: Math.round(calculateHours(lastWeekAttendances) * 100) / 100,
      thisWeekAttendances: thisWeekAttendances.length,
      lastWeekAttendances: lastWeekAttendances.length,
    }
  })
}

async function getCustomerAnalysis(userId: string, now: Date, userRole?: string, userOrgId?: string) {
  // Últimos 3 meses
  const threeMonthsAgo = subMonths(now, 3)
  
  const attendances = await prisma.attendance.findMany({
    where: {
      userId,
      checkIn: { gte: threeMonthsAgo },
      customer: { isNot: null }
    },
    include: {
      customer: true,
      supportType: true,
    },
  })

  // Análise por cliente
  const customerStats = attendances.reduce((acc: any, att) => {
    if (!att.customer) return acc
    
    const customerId = att.customer.id
    if (!acc[customerId]) {
      acc[customerId] = {
        customer: att.customer,
        totalAttendances: 0,
        totalHours: 0,
        supportTypes: {},
        avgRating: 0,
        ratings: []
      }
    }
    
    acc[customerId].totalAttendances++
    
    if (att.checkOut) {
      const hours = (new Date(att.checkOut).getTime() - new Date(att.checkIn).getTime()) / (1000 * 60 * 60)
      acc[customerId].totalHours += hours
    }
    
    if (att.supportType) {
      const typeName = typeof att.supportType === 'object' ? att.supportType.name : att.supportType
      acc[customerId].supportTypes[typeName] = (acc[customerId].supportTypes[typeName] || 0) + 1
    }
    
    if (att.rating) {
      acc[customerId].ratings.push(att.rating)
    }
    
    return acc
  }, {})

  // Calcular médias e ordenar
  const customerData = Object.values(customerStats).map((stat: any) => {
    const avgRating = stat.ratings.length > 0 
      ? stat.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / stat.ratings.length
      : 0
    
    return {
      ...stat,
      totalHours: Math.round(stat.totalHours * 100) / 100,
      avgHours: stat.totalAttendances > 0 ? Math.round((stat.totalHours / stat.totalAttendances) * 100) / 100 : 0,
      avgRating: Math.round(avgRating * 100) / 100,
      topSupportType: Object.keys(stat.supportTypes).reduce((a, b) => 
        stat.supportTypes[a] > stat.supportTypes[b] ? a : b, Object.keys(stat.supportTypes)[0] || 'N/A'
      )
    }
  }).sort((a, b) => b.totalHours - a.totalHours)

  // Análise por tipo de suporte
  const supportTypeStats = attendances.reduce((acc: any, att) => {
    if (att.supportType) {
      const typeName = typeof att.supportType === 'object' ? att.supportType.name : att.supportType
      if (!acc[typeName]) {
        acc[typeName] = { count: 0, totalHours: 0 }
      }
      acc[typeName].count++
      if (att.checkOut) {
        const hours = (new Date(att.checkOut).getTime() - new Date(att.checkIn).getTime()) / (1000 * 60 * 60)
        acc[typeName].totalHours += hours
      }
    }
    return acc
  }, {})

  const supportTypeData = Object.entries(supportTypeStats).map(([name, stats]: [string, any]) => ({
    name,
    count: stats.count,
    totalHours: Math.round(stats.totalHours * 100) / 100,
    avgHours: stats.count > 0 ? Math.round((stats.totalHours / stats.count) * 100) / 100 : 0
  })).sort((a, b) => b.count - a.count)

  return NextResponse.json({
    topCustomers: customerData.slice(0, 10),
    allCustomers: customerData,
    supportTypes: supportTypeData,
    totalCustomers: customerData.length,
    totalAttendances: attendances.length
  })
}

async function getKPIData(userId: string, now: Date, userRole?: string, userOrgId?: string) {
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  // Dados do mês atual
  const currentMonthAttendances = await prisma.attendance.findMany({
    where: {
      userId,
      checkIn: { gte: monthStart, lte: monthEnd },
    },
    include: { customer: true, supportType: true }
  })

  // Dados do mês passado
  const lastMonthAttendances = await prisma.attendance.findMany({
    where: {
      userId,
      checkIn: { gte: lastMonthStart, lte: lastMonthEnd },
    },
  })

  const calculateHours = (attendances: any[]) => 
    attendances.reduce((total, att) => {
      if (att.checkOut) {
        return total + (new Date(att.checkOut).getTime() - new Date(att.checkIn).getTime()) / (1000 * 60 * 60)
      }
      return total
    }, 0)

  const currentHours = calculateHours(currentMonthAttendances)
  const lastHours = calculateHours(lastMonthAttendances)
  const hoursGrowth = lastHours > 0 ? ((currentHours - lastHours) / lastHours) * 100 : 0

  const attendancesGrowth = lastMonthAttendances.length > 0 
    ? ((currentMonthAttendances.length - lastMonthAttendances.length) / lastMonthAttendances.length) * 100 
    : 0

  const uniqueCustomers = new Set(currentMonthAttendances.map(att => att.customer?.id).filter(Boolean)).size
  const lastMonthCustomers = new Set(lastMonthAttendances.map(att => att.customerId).filter(Boolean)).size
  const customerGrowth = lastMonthCustomers > 0 ? ((uniqueCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 : 0

  // Ratings médios
  const ratingsThisMonth = currentMonthAttendances.filter(att => att.rating).map(att => att.rating as number)
  const avgRating = ratingsThisMonth.length > 0 
    ? ratingsThisMonth.reduce((sum, rating) => sum + rating, 0) / ratingsThisMonth.length
    : 0

  return NextResponse.json({
    kpis: {
      totalHours: Math.round(currentHours * 100) / 100,
      hoursGrowth: Math.round(hoursGrowth * 100) / 100,
      totalAttendances: currentMonthAttendances.length,
      attendancesGrowth: Math.round(attendancesGrowth * 100) / 100,
      uniqueCustomers,
      customerGrowth: Math.round(customerGrowth * 100) / 100,
      avgRating: Math.round(avgRating * 100) / 100,
      avgHoursPerAttendance: currentMonthAttendances.length > 0 
        ? Math.round((currentHours / currentMonthAttendances.length) * 100) / 100 
        : 0
    }
  })
}