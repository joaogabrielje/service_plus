
"use client";
import React from "react";
import Link from "next/link";
import { usePermissions } from "@/lib/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

export default function OrganizationsPage() {
  const permissions = usePermissions();
  const [empresas, setEmpresas] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Verificar se tem permissão para gerenciar organizações
  if (!permissions.isOwner) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Gerenciar Empresas</h1>
          <p className="text-muted-foreground">Gerencie as empresas do sistema.</p>
        </div>
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para gerenciar empresas. Apenas OWNERS podem acessar esta área.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  React.useEffect(() => {
    fetch("/api/organizations")
      .then(res => res.json())
      .then(data => {
        setEmpresas(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Empresas</h1>
          <p className="text-muted-foreground">Gerencie as empresas que utilizam seu sistema.</p>
        </div>
        <Link href="/dashboard/organizations/new" className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 hover:scale-105 transition-all font-semibold">
          + Nova Empresa
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full"><p>Carregando...</p></div>
        ) : empresas.length === 0 ? (
          <div className="col-span-full"><p>Nenhuma empresa cadastrada ainda.</p></div>
        ) : (
          empresas.map(org => (
            <div key={org.id} className="bg-white rounded-xl shadow p-6 flex flex-col justify-between h-full border border-gray-200 transition-all hover:border-blue-500 hover:shadow-lg">
              <div>
                <div className="font-bold text-lg mb-1 text-gray-800">{org.name}</div>
                <div className="text-xs text-gray-500 mb-1">CNPJ: {org.cnpj}</div>
                <div className="text-xs text-gray-500">Cidade: {org.city || "-"}</div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link href={`/dashboard/organizations/edit/${org.id}`} className="px-3 py-1 rounded bg-blue-50 text-blue-700 font-semibold transition-all hover:bg-blue-600 hover:text-white">Editar</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
