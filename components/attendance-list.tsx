"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Clock, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Attendance } from "@/types"

interface AttendanceListProps {
  refresh?: number
}

export function AttendanceList({ refresh }: AttendanceListProps) {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchAttendances = async () => {
    try {
      const response = await fetch("/api/attendances")
      const data = await response.json()

      if (response.ok) {
        setAttendances(data.attendances)
      } else {
        setError(data.error || "Erro ao carregar atendimentos")
      }
    } catch (error) {
      setError("Erro ao carregar atendimentos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAttendances()
  }, [refresh])

  const calculateHours = (checkIn: Date, checkOut?: Date | null) => {
    if (!checkOut) return "Em andamento"

    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full min-h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-5 w-5" />
          Histórico de Atendimentos
        </CardTitle>
        <CardDescription>Seus registros de entrada e saída</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        {error && <div className="text-center py-8 text-muted-foreground">{error}</div>}

        {!error && attendances.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">Nenhum atendimento registrado ainda.</div>
        )}

        {!error && attendances.length > 0 && (
          <div className="space-y-4">
            {attendances.map((attendance) => (
              <div
                key={attendance.id}
                className="p-4 border border-border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {format(new Date(attendance.checkIn), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Entrada: {format(new Date(attendance.checkIn), "HH:mm", { locale: ptBR })}
                      {attendance.checkOut && (
                        <> • Saída: {format(new Date(attendance.checkOut), "HH:mm", { locale: ptBR })}</>
                      )}
                    </p>
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-semibold">Cliente:</span> {attendance.customer?.name || "-"} <br />
                      <span className="font-semibold">Atendimento:</span> {
                        typeof attendance.supportType === "object" && attendance.supportType?.name
                          ? attendance.supportType.name
                          : typeof attendance.supportType === "string"
                            ? attendance.supportType
                            : "-"
                      } <br />
                      <span className="font-semibold">Modo:</span> {attendance.supportMode || "-"}
                    </div>
                    {attendance.notes && (
                      <div className="text-xs mt-1"><span className="font-semibold">Obs:</span> {attendance.notes}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={attendance.checkOut ? "default" : "secondary"}>
                    {calculateHours(attendance.checkIn, attendance.checkOut)}
                  </Badge>
                  {!attendance.checkOut && <Badge variant="outline">Em andamento</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={fetchAttendances}>
            Atualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
