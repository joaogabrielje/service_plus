import { useSession } from "next-auth/react"
import { useMemo } from "react"

export interface UserPermissions {
  // Permissões básicas
  canViewOwnData: boolean
  canEditOwnData: boolean
  
  // Permissões de administrador da empresa
  canViewCompanyData: boolean
  canEditCompanyData: boolean
  canManageUsers: boolean
  canViewAllAttendances: boolean
  canEditAllAttendances: boolean
  canViewAllCustomers: boolean
  canEditAllCustomers: boolean
  canViewReports: boolean
  canManageCompanySettings: boolean
  
  // Permissões de owner/super admin
  canViewAllCompanies: boolean
  canManageAllCompanies: boolean
  
  // Informações do usuário
  role: string | null
  orgId: string | null
  isCompanyAdmin: boolean
  isOwner: boolean
  isEmployee: boolean
}

export function usePermissions(): UserPermissions {
  const { data: session } = useSession()
  
  return useMemo(() => {
    const user = session?.user as any
    const role = user?.role || null
    const orgId = user?.orgId || null
    
    // Determinar tipo de usuário
    const isOwner = role === "OWNER"
    const isCompanyAdmin = role === "ADMIN"
    const isEmployee = role === "EMPLOYEE" || (!role && orgId) // Usuário comum com orgId
    
    // Definir permissões baseadas no role
    const permissions: UserPermissions = {
      role,
      orgId,
      isCompanyAdmin,
      isOwner,
      isEmployee,
      
      // Permissões básicas (todos têm)
      canViewOwnData: true,
      canEditOwnData: true,
      
      // Permissões de administrador da empresa
      canViewCompanyData: isCompanyAdmin || isOwner,
      canEditCompanyData: isCompanyAdmin || isOwner,
      canManageUsers: isCompanyAdmin || isOwner,
      canViewAllAttendances: isCompanyAdmin || isOwner,
      canEditAllAttendances: isCompanyAdmin || isOwner,
      canViewAllCustomers: isCompanyAdmin || isOwner,
      canEditAllCustomers: isCompanyAdmin || isOwner,
      canViewReports: isCompanyAdmin || isOwner,
      canManageCompanySettings: isCompanyAdmin || isOwner,
      
      // Permissões de owner/super admin (apenas OWNER)
      canViewAllCompanies: isOwner,
      canManageAllCompanies: isOwner,
    }
    
    return permissions
  }, [session])
}

// Hook para verificar permissão específica
export function useHasPermission(permission: keyof UserPermissions): boolean {
  const permissions = usePermissions()
  return permissions[permission] as boolean
}

// Hook para obter informações do usuário atual
export function useCurrentUser() {
  const { data: session } = useSession()
  const permissions = usePermissions()
  
  return {
    user: session?.user,
    ...permissions,
    isLoggedIn: !!session
  }
}