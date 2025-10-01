"use client"
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  let title = "";
  let description = "";
  if (type === "login") {
    title = "Login realizado com sucesso!";
    description = "Você entrou com sucesso e já pode acessar o sistema.";
  } else {
    title = "Cadastro realizado com sucesso!";
    description = "Sua conta foi criada e você já está autenticado.";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/50 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">{title}</h1>
        <p className="mb-6">{description}</p>
        <Button className="w-full" onClick={() => router.push("/dashboard")}>Continuar para o Dashboard</Button>
      </div>
    </div>
  );
}
