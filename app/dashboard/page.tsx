"use client"

import { useState } from "react"
import Link from "next/link"
import { AttendanceForm } from "@/components/attendance-form"
import { AttendanceList } from "@/components/attendance-list"
import { StatsCards } from "@/components/stats-cards"
import { AdminStatusBanner } from "@/components/admin-status-banner"

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      {/* Admin Banner */}
      <AdminStatusBanner />
      {/* Stats Cards */}
      <StatsCards />
      {/* Attendance List */}
      <AttendanceList refresh={refreshKey} />
    </div>
  )
}
