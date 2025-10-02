"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Clock, Calendar, Target } from "lucide-react"

interface MonthlyData {
  month: string
  hours: number
  attendances: number
  avgHoursPerDay: number
}

interface WeekComparison {
  thisWeek: number
  lastWeek: number
  thisWeekAttendances: number
  lastWeekAttendances: number
}

interface ProductivityData {
  monthlyData: MonthlyData[]
  weekComparison: WeekComparison
}

export function ProductivityReport() {
  const [data, setData] = useState<ProductivityData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProductivityData = async () => {
      try {
        const response = await fetch('/api/reports?type=productivity')
        const result = await response.json()
        if (response.ok) {
          setData(result)
        }
      } catch (error) {
        console.error('Error fetching productivity data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductivityData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Erro ao carregar dados de produtividade</p>
        </CardContent>
      </Card>
    )
  }

  const weekGrowth = data.weekComparison.lastWeek > 0 
    ? ((data.weekComparison.thisWeek - data.weekComparison.lastWeek) / data.weekComparison.lastWeek) * 100 
    : 0

  const attendanceGrowth = data.weekComparison.lastWeekAttendances > 0 
    ? ((data.weekComparison.thisWeekAttendances - data.weekComparison.lastWeekAttendances) / data.weekComparison.lastWeekAttendances) * 100 
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Relatório de Produtividade</h2>
        <p className="text-muted-foreground">Análise de horas trabalhadas e performance ao longo do tempo</p>
      </div>

      {/* Cards de Comparação Semanal */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.weekComparison.thisWeek}h</div>
            <p className="text-xs text-muted-foreground">
              {data.weekComparison.thisWeekAttendances} atendimentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Semana Anterior</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.weekComparison.lastWeek}h</div>
            <p className="text-xs text-muted-foreground">
              {data.weekComparison.lastWeekAttendances} atendimentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variação Horas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${weekGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {weekGrowth >= 0 ? '+' : ''}{weekGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs semana anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variação Atendimentos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${attendanceGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {attendanceGrowth >= 0 ? '+' : ''}{attendanceGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">vs semana anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Horas Mensais */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução de Horas Trabalhadas</CardTitle>
          <CardDescription>Últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  `${value}h`, 
                  name === 'hours' ? 'Horas' : 'Atendimentos'
                ]}
              />
              <Bar dataKey="hours" fill="#3b82f6" name="hours" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Atendimentos */}
      <Card>
        <CardHeader>
          <CardTitle>Quantidade de Atendimentos</CardTitle>
          <CardDescription>Evolução mensal de atendimentos realizados</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}`, 'Atendimentos']}
              />
              <Line 
                type="monotone" 
                dataKey="attendances" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Resumo */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Detalhado</CardTitle>
          <CardDescription>Dados mensais completos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Mês</th>
                  <th className="text-right p-2">Horas Totais</th>
                  <th className="text-right p-2">Atendimentos</th>
                  <th className="text-right p-2">Média Horas/Dia</th>
                  <th className="text-right p-2">Média Horas/Atendimento</th>
                </tr>
              </thead>
              <tbody>
                {data.monthlyData.map((month, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{month.month}</td>
                    <td className="p-2 text-right">{month.hours}h</td>
                    <td className="p-2 text-right">{month.attendances}</td>
                    <td className="p-2 text-right">{month.avgHoursPerDay}h</td>
                    <td className="p-2 text-right">
                      {month.attendances > 0 ? (month.hours / month.attendances).toFixed(1) : '0'}h
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}