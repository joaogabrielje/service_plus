"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, UserPlus, Settings, Shield, Trash2, Building2 } from "lucide-react"
import { usePermissions } from "@/lib/usePermissions"
import { AdminStatusBanner } from "@/components/admin-status-banner"

interface CompanyUser {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
  lastLogin?: string
  organizationName?: string
  organizationId?: string
}

interface Organization {
  id: string
  name: string
  userCount: number
}

export default function CompanyUsersPage() {
  const permissions = usePermissions()
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Formulário de novo usuário
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserRole, setNewUserRole] = useState("EMPLOYEE")
  const [newUserOrgId, setNewUserOrgId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Verificar se tem permissão
  if (!permissions.canManageUsers) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Gerenciar usuários da empresa</p>
        </div>
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para gerenciar usuários.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  useEffect(() => {
    fetchUsers()
    if (permissions.isOwner) {
      fetchOrganizations()
    }
  }, [permissions.isOwner])

  useEffect(() => {
    if (selectedOrgId) {
      fetchUsers()
    }
  }, [selectedOrgId])

  const fetchUsers = async () => {
    try {
      const url = selectedOrgId && selectedOrgId !== "all" 
        ? `/api/company-users?orgId=${selectedOrgId}`
        : '/api/company-users'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users)
      } else {
        setError(data.error || "Erro ao carregar usuários")
      }
    } catch (error) {
      setError("Erro ao carregar usuários")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations')
      const data = await response.json()
      
      if (response.ok) {
        setOrganizations(data.organizations)
      }
    } catch (error) {
      console.error("Erro ao carregar organizações:", error)
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch('/api/company-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          role: newUserRole,
          orgId: permissions.isOwner ? newUserOrgId : undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Usuário criado com sucesso!")
        setNewUserName("")
        setNewUserEmail("")
        setNewUserRole("EMPLOYEE")
        setNewUserOrgId("")
        setShowAddUser(false)
        fetchUsers()
      } else {
        setError(data.error || "Erro ao criar usuário")
      }
    } catch (error) {
      setError("Erro ao criar usuário")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
      const response = await fetch(`/api/company-users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setSuccess(`Usuário ${newStatus === "ACTIVE" ? "ativado" : "desativado"} com sucesso!`)
        fetchUsers()
      } else {
        const data = await response.json()
        setError(data.error || "Erro ao alterar status do usuário")
      }
    } catch (error) {
      setError("Erro ao alterar status do usuário")
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case "ADMIN": return "Administrador"
      case "EMPLOYEE": return "Funcionário"
      case "OWNER": return "Proprietário"
      default: return role
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-blue-100 text-blue-800"
      case "EMPLOYEE": return "bg-gray-100 text-gray-800"
      case "OWNER": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
        <p className="text-muted-foreground">
          {permissions.isOwner 
            ? "Gerenciar usuários de todas as empresas" 
            : "Gerenciar usuários da sua empresa"
          }
        </p>
      </div>

      <AdminStatusBanner />

      {/* Filtro por Empresa (apenas para OWNER) */}
      {permissions.isOwner && organizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Filtrar por Empresa
            </CardTitle>
            <CardDescription>
              Selecione uma empresa para gerenciar seus usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedOrgId === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedOrgId("all")}
              >
                Todas as Empresas ({users.length})
              </Button>
              {organizations.map((org) => (
                <Button
                  key={org.id}
                  variant={selectedOrgId === org.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedOrgId(org.id)}
                >
                  {org.name} ({org.userCount})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Botão para adicionar usuário */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários da Empresa
              </CardTitle>
              <CardDescription>
                {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddUser(!showAddUser)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Adicionar Usuário
            </Button>
          </div>
        </CardHeader>

        {showAddUser && (
          <CardContent className="border-t">
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Nome completo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Função</Label>
                  <select
                    id="role"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md"
                  >
                    <option value="EMPLOYEE">Funcionário</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                
                {permissions.isOwner && (
                  <div className="space-y-2">
                    <Label htmlFor="orgId">Empresa</Label>
                    <select
                      id="orgId"
                      value={newUserOrgId}
                      onChange={(e) => setNewUserOrgId(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md"
                      required={permissions.isOwner}
                    >
                      <option value="">Selecione uma empresa...</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Criando..." : "Criar Usuário"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddUser(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Lista de usuários */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
            </CardContent>
          </Card>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </CardContent>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleName(user.role)}
                        </Badge>
                        <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>
                          {user.status === "ACTIVE" ? "Ativo" : "Inativo"}
                        </Badge>
                        {permissions.isOwner && user.organizationName && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {user.organizationName}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {permissions.isOwner && user.organizationName && (
                        <p className="text-xs text-muted-foreground">
                          Empresa: {user.organizationName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        {user.lastLogin && (
                          <> • Último login: {new Date(user.lastLogin).toLocaleDateString('pt-BR')}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleUserStatus(user.id, user.status)}
                    >
                      {user.status === "ACTIVE" ? "Desativar" : "Ativar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}