"use client"

import { usePermissions } from "@/lib/usePermissions"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Building } from "lucide-react"

export function AdminStatusBanner() {
  const permissions = usePermissions()

  if (!permissions.isCompanyAdmin && !permissions.isOwner) {
    return null
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg text-blue-900">
            {permissions.isOwner ? "Modo Super Administrador" : "Modo Administrador da Empresa"}
          </CardTitle>
        </div>
        <CardDescription className="text-blue-700">
          {permissions.isOwner 
            ? "Você tem acesso a todas as empresas e dados do sistema"
            : "Você pode visualizar e gerenciar todos os dados da sua empresa"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Users className="h-3 w-3 mr-1" />
            {permissions.isOwner ? "Todas as Empresas" : "Toda a Empresa"}
          </Badge>
          
          {permissions.canViewAllAttendances && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Todos os Atendimentos
            </Badge>
          )}
          
          {permissions.canManageUsers && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              Gerenciar Usuários
            </Badge>
          )}
          
          {permissions.canViewReports && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Relatórios Completos
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}