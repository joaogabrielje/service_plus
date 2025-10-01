"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function TestGooglePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Teste Google OAuth</h1>
        
        {session ? (
          <div className="space-y-4">
            <div className="text-left bg-green-50 p-3 rounded">
              <p className="text-green-800"><strong>✅ LOGADO COM SUCESSO!</strong></p>
              <p><strong>Nome:</strong> {session.user?.name}</p>
              <p><strong>Email:</strong> {session.user?.email}</p>
              <p><strong>ID:</strong> {(session.user as any)?.id}</p>
              <p><strong>Role:</strong> {(session.user as any)?.role || 'Sem role'}</p>
              <p><strong>OrgId:</strong> {(session.user as any)?.orgId || 'Sem org'}</p>
            </div>
            {session.user?.image && (
              <img 
                src={session.user.image} 
                alt="Avatar" 
                className="w-16 h-16 rounded-full mx-auto"
              />
            )}
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.href = '/auth/set-password'} 
                className="w-full"
              >
                Ir para Definir Senha
              </Button>
              <Button 
                onClick={() => window.location.href = '/dashboard'} 
                variant="outline"
                className="w-full"
              >
                Ir para Dashboard
              </Button>
              <Button onClick={() => signOut()} variant="destructive" className="w-full">
                Fazer Logout
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p>Não está logado</p>
            <Button 
              onClick={() => signIn("google")} 
              className="w-full"
            >
              Login com Google (Simples)
            </Button>
            <Button 
              onClick={async () => {
                console.log('Tentando login com Google para registro...')
                const result = await signIn("google", { 
                  callbackUrl: "/auth/set-password",
                  redirect: true 
                })
                console.log('Resultado do signIn:', result)
              }}
              variant="outline"
              className="w-full"
            >
              Login com Google (Registro) - Debug
            </Button>
            <Button 
              onClick={() => {
                window.location.href = '/api/auth/signin/google?callbackUrl=' + encodeURIComponent('/auth/set-password')
              }}
              variant="secondary"
              className="w-full"
            >
              Login Google (URL Direta)
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}