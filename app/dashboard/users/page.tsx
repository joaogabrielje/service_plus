"use client";
import React from "react";
import { RegisterForm } from "@/components/register-form";

export default function UsersPage() {
  const [showModal, setShowModal] = React.useState(false);

  const [users, setUsers] = React.useState<Array<{ id: string; name: string; email: string; role?: string }>>([]);
  React.useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div className="space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
        <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
      </div>
      <div className="flex flex-wrap gap-4 mb-6">
        <a
          href="/dashboard/users/new"
          className="border border-primary text-primary bg-transparent px-6 py-3 rounded-xl font-semibold text-base shadow-lg transition-all duration-200 hover:bg-primary hover:text-primary-foreground hover:shadow-xl focus:ring-2 focus:ring-primary"
        >
          + Novo Usuário
        </a>
        <a
          href="/dashboard/users/link"
          className="border border-secondary text-secondary bg-transparent px-6 py-3 rounded-xl font-semibold text-base shadow-lg transition-all duration-200 hover:bg-secondary hover:text-secondary-foreground hover:shadow-xl focus:ring-2 focus:ring-secondary"
        >
          Vincular Usuário à Empresa
        </a>
      </div>
      <div className="w-full h-full flex flex-col">
        <h2 className="text-xl font-bold mb-2">Lista de Usuários</h2>
        <div className="w-full h-full">
          {users.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <span className="text-muted-foreground">Nenhum usuário cadastrado ainda.</span>
            </div>
          ) : (
            <ul className="space-y-3">
              {users.map(user => (
                <li key={user.id} className="border rounded p-3 flex flex-col">
                  <span className="font-semibold">{user.name}</span>
                  <span className="text-xs text-muted-foreground">{user.email}</span>
                  {user.role && <span className="text-xs text-muted-foreground">Papel: {user.role}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}