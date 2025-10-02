"use client"

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

export function DashboardHeader() {
  const { data: session } = useSession()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const isOwner = (session?.user as any)?.role === "OWNER";
  
  // Debug: log session data
  console.log('Session data:', session);
  console.log('User role:', (session?.user as any)?.role);
  console.log('Is owner:', isOwner);

  return (
    <header className="bg-background border-b border-border px-6 sticky top-0 z-30" style={{ height: '65px' }}>
      <div className="flex items-center justify-between h-full w-full">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          {isOwner && (
            <Button type="button" variant="outline" className="border border-secondary">
              <a href="/dashboard/organizations">Gerenciar Empresas</a>
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-3">
            <Avatar>
              {session?.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || "Avatar"}
                  className="w-full h-full object-cover rounded-full"
                />
              )}
              <AvatarFallback className="bg-primary text-primary-foreground">
                {session?.user?.name ? getInitials(session.user.name) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground">{session?.user?.name || "Usuário"}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
