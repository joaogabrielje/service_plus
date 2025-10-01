"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  // Se não estiver autenticado, redirecionar para login
  useEffect(() => {
    if (status === "loading") return // Ainda carregando
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      return
    }
    setIsLoading(true)
    const res = await fetch("/api/auth/set-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
    setIsLoading(false)
    if (res.ok) {
      router.push("/auth/success?type=register")
    } else {
      const data = await res.json()
      setError(data.error || "Erro ao definir senha.")
    }
  }

  // Mostrar loading enquanto carrega a sessão
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 px-4">
        <div className="text-center">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não há sessão, não renderizar nada (redirecionamento está no useEffect)
  if (!session?.user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Definir senha</CardTitle>
          <CardDescription>
            Crie uma senha para acessar também com e-mail e senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Mostrar informações da conta Google */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Conta Google conectada:</strong>
            </p>
            <div className="flex items-center gap-3">
              {session.user.image && (
                <img 
                  src={session.user.image} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-blue-900">{session.user.name}</p>
                <p className="text-sm text-blue-700">{session.user.email}</p>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Esta não é sua conta? 
              <button 
                type="button"
                onClick={() => signOut({ callbackUrl: "/auth/register" })}
                className="ml-1 underline hover:no-underline"
              >
                Trocar conta
              </button>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Confirme a senha"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
