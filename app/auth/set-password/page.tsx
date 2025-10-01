"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Definir senha</h1>
        <p className="mb-6">Crie uma senha para acessar também com e-mail e senha.</p>
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
      </div>
    </div>
  )
}
