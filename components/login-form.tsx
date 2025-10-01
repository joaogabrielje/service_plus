"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email ou senha inválidos")
        setLoginAttempts((prev) => prev + 1)
      } else {
        setLoginAttempts(0)
        router.push("/dashboard")
      }
    } catch (error) {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
  <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>Entre com suas credenciais ou utilize o Google</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          className="w-full mb-4 flex items-center justify-center gap-2"
          variant="outline"
          onClick={() => signIn("google", { callbackUrl: "/auth/success?type=login" })}
        >
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#clip0_17_40)"><path d="M47.5 24.552C47.5 22.864 47.346 21.232 47.066 19.667H24V28.334H37.125C36.566 31.334 34.75 33.834 32.016 35.417V40.084H39.75C44.25 36.084 47.5 30.917 47.5 24.552Z" fill="#4285F4"/><path d="M24 48C30.48 48 35.917 45.917 39.75 40.084L32.016 35.417C30.083 36.667 27.417 37.5 24 37.5C17.75 37.5 12.417 33.417 10.583 27.917H2.625V32.75C6.417 40.167 14.417 48 24 48Z" fill="#34A853"/><path d="M10.583 27.917C10.083 26.667 9.833 25.334 9.833 24C9.833 22.667 10.083 21.334 10.583 20.084V15.25H2.625C1.25 18.083 0.5 21 0.5 24C0.5 27 1.25 29.917 2.625 32.75L10.583 27.917Z" fill="#FBBC05"/><path d="M24 10.5C27.75 10.5 30.833 11.834 33.083 13.917L39.917 7.083C35.917 3.417 30.48 0 24 0C14.417 0 6.417 7.833 2.625 15.25L10.583 20.084C12.417 14.584 17.75 10.5 24 10.5Z" fill="#EA4335"/></g><defs><clipPath id="clip0_17_40"><rect width="48" height="48" fill="white"/></clipPath></defs></svg>
          Entrar com Google
        </Button>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>
        <div className="mt-4 text-center text-sm space-y-2">
          <div>
            Não tem uma conta?{" "}
            <Link href="/auth/register" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </div>
          <div>
            <Link href="/auth/forgot-password" className="text-primary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>
          {loginAttempts >= 3 && (
            <div className="text-red-500 text-xs mt-2">
              Está com dificuldades para acessar? <Link href="/auth/forgot-password" className="underline">Redefina sua senha</Link>.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
