"use client";
import { RegisterForm } from "@/components/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function UsersList() {
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role?: string }>>([]);
  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);
  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">Usuários Cadastrados</h2>
      {users.length === 0 ? (
        <p className="text-muted-foreground">Nenhum usuário cadastrado ainda.</p>
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
  );
}

export default function NewUserPage() {
  // Obter orgId do usuário logado (dono/admin)
  const { data: session } = useSession();

  return (
    <div className="p-8 min-h-screen flex flex-col md:flex-row gap-8 items-stretch justify-center">
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-stretch gap-8">
        <div className="w-full h-full flex flex-col justify-center">
          <div className="w-full h-full flex items-center">
            <RegisterForm />
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 h-full flex flex-col overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Usuários Cadastrados</h2>
        <UsersList />
      </div>
    </div>
  );
}
