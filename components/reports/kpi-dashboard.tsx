"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity, Users, Clock, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface KPIData {
  totalHours: number
  hoursGrowth: number
  totalAttendances: number
  attendancesGrowth: number
  uniqueCustomers: number
  customerGrowth: number
  avgRating: number
  avgHoursPerAttendance: number
}

export function KPIDashboard() {
  const [data, setData] = useState<KPIData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        const response = await fetch('/api/reports?type=kpi')
        const result = await response.json()
        if (response.ok) {
          setData(result.kpis)
        }
      } catch (error) {
        console.error('Error fetching KPI data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchKPIData()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
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
          <p className="text-muted-foreground">Erro ao carregar dados dos KPIs</p>
        </CardContent>
      </Card>
    )
  }

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    return {
      value: `${isPositive ? '+' : ''}${growth.toFixed(1)}%`,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">KPIs do Mês</h2>
        <p className="text-muted-foreground">Indicadores principais comparados ao mês anterior</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Horas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Horas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalHours}h</div>
            <div className="flex items-center text-xs">
              {(() => {
                const growth = formatGrowth(data.hoursGrowth)
                const Icon = growth.icon
                return (
                  <>
                    <Icon className={`mr-1 h-3 w-3 ${growth.color}`} />
                    <span className={growth.color}>{growth.value}</span>
                    <span className="text-muted-foreground ml-1">vs mês anterior</span>
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Total de Atendimentos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAttendances}</div>
            <div className="flex items-center text-xs">
              {(() => {
                const growth = formatGrowth(data.attendancesGrowth)
                const Icon = growth.icon
                return (
                  <>
                    <Icon className={`mr-1 h-3 w-3 ${growth.color}`} />
                    <span className={growth.color}>{growth.value}</span>
                    <span className="text-muted-foreground ml-1">vs mês anterior</span>
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Clientes Únicos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.uniqueCustomers}</div>
            <div className="flex items-center text-xs">
              {(() => {
                const growth = formatGrowth(data.customerGrowth)
                const Icon = growth.icon
                return (
                  <>
                    <Icon className={`mr-1 h-3 w-3 ${growth.color}`} />
                    <span className={growth.color}>{growth.value}</span>
                    <span className="text-muted-foreground ml-1">vs mês anterior</span>
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Avaliação Média */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.avgRating > 0 ? data.avgRating.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.avgRating > 0 ? '⭐'.repeat(Math.round(data.avgRating)) : 'Sem avaliações'}
            </p>
          </CardContent>
        </Card>

        {/* Média de Horas por Atendimento */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Eficiência</CardTitle>
            <CardDescription>Tempo médio por atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-primary">
                {data.avgHoursPerAttendance}h
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Tempo médio investido por atendimento neste mês
                </p>
                <div className="flex items-center mt-2">
                  {data.avgHoursPerAttendance <= 2 && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Eficiente
                    </Badge>
                  )}
                  {data.avgHoursPerAttendance > 2 && data.avgHoursPerAttendance <= 4 && (
                    <Badge variant="secondary">
                      Moderado
                    </Badge>
                  )}
                  {data.avgHoursPerAttendance > 4 && (
                    <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                      Longo
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Resumo do Período</CardTitle>
            <CardDescription>Principais insights do mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total de horas trabalhadas:</span>
                <span className="font-medium">{data.totalHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Atendimentos realizados:</span>
                <span className="font-medium">{data.totalAttendances}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Clientes atendidos:</span>
                <span className="font-medium">{data.uniqueCustomers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Satisfação média:</span>
                <span className="font-medium">
                  {data.avgRating > 0 ? `${data.avgRating.toFixed(1)}/5` : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}