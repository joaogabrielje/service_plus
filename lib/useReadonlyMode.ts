"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

// Hook principal para usar o modo readonly
export const useReadonlyMode = () => {
  const [isReadonlyMode, setIsReadonlyMode] = useState(false)
  const { data: session } = useSession()

  // Verificar automaticamente se o usuário tem vínculo com empresa
  useEffect(() => {
    if (session?.user) {
      const userOrgId = (session.user as any).orgId
      const userRole = (session.user as any).role
      
      // Se não tem orgId ou role, está em modo readonly
      const shouldBeReadonly = !userOrgId || !userRole
      setIsReadonlyMode(shouldBeReadonly)
      
      console.log('Verificação de readonly:', {
        userOrgId,
        userRole,
        shouldBeReadonly
      })
    }
  }, [session])

  const setReadonlyMode = (enabled: boolean) => {
    setIsReadonlyMode(enabled)
  }

  const toggleReadonlyMode = () => {
    setIsReadonlyMode(!isReadonlyMode)
  }

  return {
    isReadonlyMode,
    setReadonlyMode,
    toggleReadonlyMode
  }
}

// Hook para verificar se uma ação deve ser bloqueada
export const useReadonlyCheck = () => {
  const { isReadonlyMode } = useReadonlyMode()
  
  const checkReadonly = (action: () => void, message?: string) => {
    if (isReadonlyMode) {
      alert(message || 'Você não tem permissão para realizar esta ação. Entre em contato com o administrador para vincular sua conta a uma organização.')
      return
    }
    action()
  }
  
  return { isReadonlyMode, checkReadonly }
}
