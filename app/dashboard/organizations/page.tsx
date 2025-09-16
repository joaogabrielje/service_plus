
"use client";
import React from "react";
import Link from "next/link";

export default function OrganizationsPage() {
  const [empresas, setEmpresas] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

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
      <h1 className="text-2xl font-bold mb-4">Empresas</h1>
      <p className="mb-6">Gerencie as empresas que utilizam seu sistema.</p>
      <Link href="/dashboard/organizations/new" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-foreground transition">
        + Nova Empresa
      </Link>
      <div className="mt-8">
        {loading ? (
          <p>Carregando...</p>
        ) : empresas.length === 0 ? (
          <p>Nenhuma empresa cadastrada ainda.</p>
        ) : (
          <div className="space-y-4">
            {empresas.map(org => (
              <div key={org.id} className="border rounded p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold">{org.name}</div>
                  <div className="text-xs text-muted-foreground">CNPJ: {org.cnpj}</div>
                  <div className="text-xs text-muted-foreground">Cidade: {org.city || "-"}</div>
                </div>
                <Link href={`/dashboard/organizations/edit/${org.id}`} className="text-primary underline">Editar</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
