"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Clock } from "lucide-react"
import { format } from "date-fns"

interface AttendanceFormProps {
  onSuccess?: () => void
}

export function AttendanceForm({ onSuccess }: AttendanceFormProps) {
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickCheckIn = () => {
    const now = new Date()
    setCheckIn(format(now, "yyyy-MM-dd'T'HH:mm"))
  }

  const handleQuickCheckOut = () => {
    const now = new Date()
    setCheckOut(format(now, "yyyy-MM-dd'T'HH:mm"))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/attendances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkIn: new Date(checkIn).toISOString(),
          checkOut: checkOut ? new Date(checkOut).toISOString() : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Atendimento registrado com sucesso!")
        setCheckIn("")
        setCheckOut("")
        onSuccess?.()
      } else {
        setError(data.error || "Erro ao registrar atendimento")
      }
    } catch (error) {
      setError("Erro ao registrar atendimento. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Registrar Atendimento
        </CardTitle>
        <CardDescription>Registre sua entrada e saída do trabalho</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn">Entrada</Label>
              <div className="flex space-x-2">
                <Input
                  id="checkIn"
                  type="datetime-local"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
                <Button type="button" variant="outline" onClick={handleQuickCheckIn}>
                  Agora
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkOut">Saída (opcional)</Label>
              <div className="flex space-x-2">
                <Input
                  id="checkOut"
                  type="datetime-local"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={handleQuickCheckOut}>
                  Agora
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar Atendimento
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
