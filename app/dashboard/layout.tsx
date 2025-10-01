import React from "react"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/header"
import { ReadonlyBanner } from "@/components/readonly-banner"
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  // Verifica vínculo do usuário
  const userEmail = session.user?.email ?? undefined
  let memberships: any[] = []
  if (userEmail) {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })
    if (user) {
      memberships = await prisma.membership.findMany({
        where: {
          userId: user.id,
          isDeleted: false,
          status: "ACTIVE",
        },
      })
    }
  }

  // Passa flag para páginas internas
  const isLimited = memberships.length === 0

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-64">
        <DashboardHeader />
        <main className="p-6">
          <ReadonlyBanner />
          {React.cloneElement(children as React.ReactElement, { isLimited })}
        </main>
      </div>
    </div>
  )
}
