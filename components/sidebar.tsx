"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Clock, BarChart3, Users, Settings, LogOut, Menu, X, Home, Shield, UserCog } from "lucide-react"
import { signOut } from "next-auth/react"
import { usePermissions } from "@/lib/usePermissions"

const baseNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Atendimentos", href: "/dashboard/attendances", icon: Clock },
  { name: "Clientes", href: "/dashboard/customers", icon: Users },
  { name: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
]

const adminNavigation = [
  { name: "Gestão de Usuários", href: "/dashboard/users/manage", icon: UserCog, adminOnly: true },
]

const generalNavigation = [
  { name: "Usuários", href: "/dashboard/users", icon: Users },
  { name: "Configurações", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const permissions = usePermissions()

  // Construir navegação baseada em permissões
  const navigation = [
    ...baseNavigation,
    ...(permissions.canManageUsers ? adminNavigation : []),
    ...generalNavigation,
  ]

  const handleSignOut = async () => {
    try {
      console.log('Iniciando logout...')
      
      // Primeiro, limpar sessões no servidor
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      // Depois, fazer logout do NextAuth
      await signOut({ 
        callbackUrl: "/",
        redirect: true
      })
    } catch (error) {
      console.error('Erro no logout:', error)
      // Fallback: redirecionar manualmente e limpar localStorage
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = "/"
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-sidebar-border">
            <Clock className="h-8 w-8 text-sidebar-primary" />
            <span className="ml-2 text-xl font-bold text-sidebar-foreground">AttendanceHub</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Sign out button */}
          <div className="px-4 py-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
