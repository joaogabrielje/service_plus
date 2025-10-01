"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye } from "lucide-react"
import { useReadonlyMode } from "@/lib/useReadonlyMode"

export function ReadonlyBanner() {
  const { isReadonlyMode } = useReadonlyMode()
  
  if (!isReadonlyMode) return null
  
  return (
    <Alert className="border-orange-200 bg-orange-50 text-orange-800 mb-4">
      <Eye className="h-4 w-4" />
      <AlertDescription>
        <strong>Acesso Limitado:</strong> Sua conta não está vinculada a nenhuma organização. 
        Você pode visualizar os dados, mas não pode fazer alterações. 
        Entre em contato com o administrador para solicitar acesso.
      </AlertDescription>
    </Alert>
  )
}
