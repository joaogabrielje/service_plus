"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";

export default function LinkUserToCompanyPage() {
  const { data: session } = useSession();
  const orgId = (session?.user as any)?.orgId || "";
  console.log('[LinkUserToCompanyPage] session:', session);
  console.log('[LinkUserToCompanyPage] orgId:', orgId);
  console.log('[LinkUserToCompanyPage] session:', session);
  console.log('[LinkUserToCompanyPage] orgId:', orgId);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/users/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, orgId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Usuário vinculado com sucesso!");
        setEmail("");
        setPassword("");
      } else {
        setError(data.error || "Erro ao vincular usuário.");
      }
    } catch {
      setError("Erro ao vincular usuário.");
    } finally {
      setLoading(false);
    }
  };

    return (
      <div className="p-8 min-h-screen flex flex-col md:flex-row gap-8 items-stretch justify-center">
        {/* Card de vinculação à esquerda */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-stretch">
          <Card className="w-full h-full flex flex-col justify-center">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Vincular Usuário à Empresa</CardTitle>
              </div>
              <CardDescription>Vincule um usuário externo à sua empresa</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLink} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email do usuário <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="border-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha do usuário <span className="text-red-500">*</span></Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="border-primary" />
                </div>
                {error && <div className="text-red-600 text-sm">{error}</div>}
                {success && <div className="text-green-600 text-sm">{success}</div>}
                <div className="flex flex-col md:flex-row gap-2 w-full">
                  <Button type="submit" className="w-full px-8 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xl focus:ring-2 focus:ring-primary" disabled={loading}>
                    {loading ? "Vinculando..." : "Vincular Usuário"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        {/* Card de instruções à direita */}
        <div className="w-full md:w-1/2 h-full flex flex-col overflow-y-auto">
          <Card className="w-full h-full flex flex-col">
            <CardHeader>
              <CardTitle>Como funciona a vinculação?</CardTitle>
              <CardDescription>Informe o email e senha do usuário externo para vinculá-lo à sua empresa.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground">
                <li>O usuário deve já estar cadastrado no sistema.</li>
                <li>Você precisa ser dono ou administrador da empresa para vincular.</li>
                <li>Após vincular, o usuário terá acesso à sua empresa.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
}
