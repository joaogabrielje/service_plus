"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Users, Clock, Star, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Customer {
  customer: {
    id: string
    name: string
    city?: string
  }
  totalAttendances: number
  totalHours: number
  avgHours: number
  avgRating: number
  topSupportType: string
}

interface SupportType {
  name: string
  count: number
  totalHours: number
  avgHours: number
}

interface CustomerAnalysisData {
  topCustomers: Customer[]
  allCustomers: Customer[]
  supportTypes: SupportType[]
  totalCustomers: number
  totalAttendances: number
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

export function CustomerAnalysis() {
  const [data, setData] = useState<CustomerAnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch('/api/reports?type=customers')
        const result = await response.json()
        if (response.ok) {
          setData(result)
        }
      } catch (error) {
        console.error('Error fetching customer data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomerData()
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
          <p className="text-muted-foreground">Erro ao carregar dados de clientes</p>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for charts
  const pieData = data.topCustomers.slice(0, 5).map((customer, index) => ({
    name: customer.customer.name.length > 15 
      ? customer.customer.name.substring(0, 15) + '...' 
      : customer.customer.name,
    value: customer.totalHours,
    color: COLORS[index]
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Análise de Clientes</h2>
        <p className="text-muted-foreground">Insights sobre seus clientes e tipos de atendimento</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Clientes atendidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Atendimentos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAttendances}</div>
            <p className="text-xs text-muted-foreground">Últimos 3 meses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Atend./Cliente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalCustomers > 0 ? (data.totalAttendances / data.totalCustomers).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground">Atendimentos por cliente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação Geral</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.allCustomers.length > 0 
                ? (data.allCustomers
                    .filter(c => c.avgRating > 0)
                    .reduce((sum, c) => sum + c.avgRating, 0) / 
                   data.allCustomers.filter(c => c.avgRating > 0).length
                  ).toFixed(1) 
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">Média das avaliações</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Top 5 Clientes por Horas */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Clientes por Horas</CardTitle>
            <CardDescription>Distribuição de tempo investido</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}h`, 'Horas']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Tipos de Suporte */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Suporte</CardTitle>
            <CardDescription>Frequência por tipo de atendimento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.supportTypes.slice(0, 8)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip formatter={(value, name) => [value, name === 'count' ? 'Atendimentos' : 'Horas']} />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Top Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Clientes</CardTitle>
          <CardDescription>Seus clientes mais importantes por tempo investido</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Cliente</th>
                  <th className="text-left p-2">Cidade</th>
                  <th className="text-right p-2">Atendimentos</th>
                  <th className="text-right p-2">Total Horas</th>
                  <th className="text-right p-2">Média Horas</th>
                  <th className="text-left p-2">Tipo Principal</th>
                  <th className="text-right p-2">Avaliação</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.slice(0, 10).map((customer, index) => (
                  <tr key={customer.customer.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{customer.customer.name}</td>
                    <td className="p-2 text-muted-foreground">{customer.customer.city || '-'}</td>
                    <td className="p-2 text-right">{customer.totalAttendances}</td>
                    <td className="p-2 text-right font-medium">{customer.totalHours}h</td>
                    <td className="p-2 text-right">{customer.avgHours}h</td>
                    <td className="p-2">
                      <Badge variant="secondary" className="text-xs">
                        {customer.topSupportType}
                      </Badge>
                    </td>
                    <td className="p-2 text-right">
                      {customer.avgRating > 0 ? (
                        <div className="flex items-center justify-end">
                          <span className="mr-1">{customer.avgRating.toFixed(1)}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Análise de Tipos de Suporte */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Tipos de Suporte</CardTitle>
          <CardDescription>Detalhamento por categoria de atendimento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.supportTypes.slice(0, 6).map((type, index) => (
              <Card key={type.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{type.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Atendimentos:</span>
                      <span className="font-medium">{type.count}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Horas:</span>
                      <span className="font-medium">{type.totalHours}h</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Média:</span>
                      <span className="font-medium">{type.avgHours}h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}