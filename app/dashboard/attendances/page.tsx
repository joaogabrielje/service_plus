"use client"

import { useState } from "react"
import { AttendanceForm } from "@/components/attendance-form"
import { AttendanceList } from "@/components/attendance-list"

export default function AttendancesPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAttendanceSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Atendimentos</h1>
        <p className="text-muted-foreground">Gerencie seus registros de entrada e saída</p>
      </div>

      <AttendanceForm onSuccess={handleAttendanceSuccess} />
      <AttendanceList refresh={refreshKey} />
    </div>
  )
}
