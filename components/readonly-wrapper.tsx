"use client"

import { ReactNode } from "react"
import { useReadonlyCheck } from "@/lib/useReadonlyMode"
import { cn } from "@/lib/utils"

interface ReadonlyWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  className?: string
  message?: string
  disabled?: boolean
}

export function ReadonlyWrapper({ 
  children, 
  fallback, 
  className, 
  message = "Você não tem permissão para realizar esta ação. Entre em contato com o administrador para vincular sua conta a uma organização.",
  disabled = false
}: ReadonlyWrapperProps) {
  const { isReadonlyMode } = useReadonlyCheck()
  
  if (isReadonlyMode) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div 
        className={cn(
          "relative opacity-60 cursor-not-allowed",
          className
        )}
        title={message}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          alert(message)
        }}
      >
        <div className="pointer-events-none">
          {children}
        </div>
      </div>
    )
  }
  
  return (
    <div className={cn(disabled && "opacity-60 cursor-not-allowed", className)}>
      {children}
    </div>
  )
}

// Componente específico para botões
export function ReadonlyButton({ 
  children, 
  onClick, 
  message = "Você não tem permissão para realizar esta ação. Entre em contato com o administrador para vincular sua conta a uma organização.",
  ...props 
}: any) {
  const { isReadonlyMode, checkReadonly } = useReadonlyCheck()
  
  const handleClick = (e: any) => {
    if (isReadonlyMode) {
      e.preventDefault()
      e.stopPropagation()
      alert(message)
      return
    }
    
    if (onClick) {
      onClick(e)
    }
  }
  
  return (
    <button 
      {...props}
      onClick={handleClick}
      className={cn(
        props.className,
        isReadonlyMode && "opacity-60 cursor-not-allowed"
      )}
      disabled={isReadonlyMode || props.disabled}
    >
      {children}
    </button>
  )
}
