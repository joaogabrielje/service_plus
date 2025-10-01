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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[600px] h-[600px]">
        <div className="h-full flex flex-col justify-stretch">
          <AttendanceForm onSuccess={handleAttendanceSuccess} />
        </div>
        <div className="h-full flex flex-col justify-stretch">
          <AttendanceList refresh={refreshKey} />
        </div>
      </div>
    </div>
  )
}
