"use client"

import { useState } from "react"
import Link from "next/link"
import { AttendanceForm } from "@/components/attendance-form"
import { AttendanceList } from "@/components/attendance-list"
import { StatsCards } from "@/components/stats-cards"

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleAttendanceSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Botão Nova Empresa */}
      <div>
        <Link
          href="/dashboard/organizations"
          className="bg-primary text-white px-4 py-2 rounded transition hover:opacity-80"
        >
          Gerenciar Empresas
        </Link>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Attendance Form */}
      <AttendanceForm onSuccess={handleAttendanceSuccess} />

      {/* Attendance List */}
      <AttendanceList refresh={refreshKey} />
    </div>
  )
}
