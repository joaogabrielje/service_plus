
"use client";
import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function EditOrganizationPage() {
  const params = useParams();
  const router = useRouter();
  const [org, setOrg] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [orgUsers, setOrgUsers] = React.useState<any[]>([]);
  const [allUsers, setAllUsers] = React.useState<any[]>([]);
  const [showLinkModal, setShowLinkModal] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState('USER');

  // Estados e cidades para select dinâmico
  const estados = [
    { sigla: "AC", nome: "Acre" }, { sigla: "AL", nome: "Alagoas" }, { sigla: "AP", nome: "Amapá" }, { sigla: "AM", nome: "Amazonas" }, { sigla: "BA", nome: "Bahia" }, { sigla: "CE", nome: "Ceará" }, { sigla: "DF", nome: "Distrito Federal" }, { sigla: "ES", nome: "Espírito Santo" }, { sigla: "GO", nome: "Goiás" }, { sigla: "MA", nome: "Maranhão" }, { sigla: "MT", nome: "Mato Grosso" }, { sigla: "MS", nome: "Mato Grosso do Sul" }, { sigla: "MG", nome: "Minas Gerais" }, { sigla: "PA", nome: "Pará" }, { sigla: "PB", nome: "Paraíba" }, { sigla: "PR", nome: "Paraná" }, { sigla: "PE", nome: "Pernambuco" }, { sigla: "PI", nome: "Piauí" }, { sigla: "RJ", nome: "Rio de Janeiro" }, { sigla: "RN", nome: "Rio Grande do Norte" }, { sigla: "RS", nome: "Rio Grande do Sul" }, { sigla: "RO", nome: "Rondônia" }, { sigla: "RR", nome: "Roraima" }, { sigla: "SC", nome: "Santa Catarina" }, { sigla: "SP", nome: "São Paulo" }, { sigla: "SE", nome: "Sergipe" }, { sigla: "TO", nome: "Tocantins" }
  ];
  const cidadesPorEstado: Record<string, string[]> = {
    AC: ["Rio Branco", "Cruzeiro do Sul"],
    AL: ["Maceió", "Arapiraca"],
    AP: ["Macapá", "Santana"],
    AM: ["Manaus", "Parintins"],
    BA: ["Salvador", "Feira de Santana", "Vitória da Conquista"],
    CE: ["Fortaleza", "Juazeiro do Norte"],
    DF: ["Brasília"],
    ES: ["Vitória", "Vila Velha"],
    GO: ["Goiânia", "Anápolis"],
    MA: ["São Luís", "Imperatriz"],
    MT: ["Cuiabá", "Várzea Grande"],
    MS: ["Campo Grande", "Dourados"],
    MG: ["Belo Horizonte", "Uberlândia", "Juiz de Fora"],
    PA: ["Belém", "Ananindeua"],
    PB: ["João Pessoa", "Campina Grande"],
    PR: ["Curitiba", "Londrina", "Maringá"],
    PE: ["Recife", "Jaboatão dos Guararapes"],
    PI: ["Teresina", "Parnaíba"],
    RJ: ["Rio de Janeiro", "Niterói", "Petrópolis"],
    RN: ["Natal", "Mossoró"],
    RS: ["Porto Alegre", "Caxias do Sul", "Pelotas"],
    RO: ["Porto Velho", "Ji-Paraná"],
    RR: ["Boa Vista"],
    SC: ["Florianópolis", "Joinville", "Blumenau"],
    SP: ["São Paulo", "Campinas", "Santos", "Ribeirão Preto"],
    SE: ["Aracaju"],
    TO: ["Palmas", "Araguaína"],
  };
  const [estado, setEstado] = React.useState("");
  const [cidade, setCidade] = React.useState("");
  const [cidades, setCidades] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (params?.id) {
      // Carregar dados da organização
      fetch(`/api/organizations/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setOrg(data);
          setEstado(data.state || "");
          setCidade(data.city || "");
          setLoading(false);
        });
      
      // Carregar usuários da organização
      loadOrgUsers();
    }
  }, [params]);

  React.useEffect(() => {
    // Carregar todos os usuários quando o modal for aberto
    if (showLinkModal) {
      loadAllUsers();
    }
  }, [showLinkModal]);

  const loadOrgUsers = () => {
    if (params?.id) {
      fetch(`/api/organizations/${params.id}/users`)
        .then(res => res.json())
        .then(data => setOrgUsers(data));
    }
  };

  const loadAllUsers = () => {
    fetch('/api/users/all')
      .then(res => res.json())
      .then(data => setAllUsers(data));
  };

  React.useEffect(() => {
    setCidades(cidadesPorEstado[estado] || []);
    if (!cidadesPorEstado[estado]?.includes(cidade)) setCidade("");
  }, [estado]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!org) return;
    const formData = new FormData(e.currentTarget);
    const res = await fetch(`/api/organizations/${org.id}`, {
      method: "PATCH",
      body: formData,
    });
    if (res.ok) {
      router.push("/dashboard/organizations");
    } else {
      alert("Erro ao salvar alterações");
    }
  };

  const handleLinkUser = async () => {
    if (!selectedUser || !params?.id) return;
    
    try {
      const res = await fetch('/api/users/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          orgId: params.id,
          role: selectedRole
        })
      });

      if (res.ok) {
        setShowLinkModal(false);
        setSelectedUser('');
        setSelectedRole('USER');
        loadOrgUsers(); // Recarregar lista de usuários
        alert('Usuário vinculado com sucesso!');
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao vincular usuário');
      }
    } catch (error) {
      alert('Erro ao vincular usuário');
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;
  if (!org || org.error) return <div className="p-8">Empresa não encontrada.</div>;

  return (
    <div className="flex gap-8 p-8">
      {/* Coluna da Esquerda - Edição da Empresa */}
      <div className="w-1/2">
        <h1 className="text-2xl font-bold mb-4">Editar Empresa</h1>
        <form className="space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Nome da Empresa</label>
            <input id="name" name="name" type="text" required defaultValue={org.name} className="w-full border border-border rounded px-3 py-2" />
          </div>
          {/* CNPJ e IE */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label htmlFor="cnpj" className="block text-sm font-medium mb-1">CNPJ</label>
              <input id="cnpj" name="cnpj" type="text" defaultValue={org.cnpj} className="w-full border border-border rounded px-3 py-2" />
            </div>
            <div className="w-1/4">
              <label htmlFor="ie" className="block text-sm font-medium mb-1">IE</label>
              <input id="ie" name="ie" type="text" defaultValue={org.ie || ""} className="w-full border border-border rounded px-2 py-2" />
            </div>
            <div className="w-1/4">
              <label htmlFor="cep" className="block text-sm font-medium mb-1">CEP</label>
              <input id="cep" name="cep" type="text" defaultValue={org.cep || ""} className="w-full border border-border rounded px-2 py-2" />
            </div>
          </div>
          {/* Estado e Cidade */}
          <div className="flex gap-4">
            <div className="w-1/4">
              <label htmlFor="state" className="block text-sm font-medium mb-1">Estado</label>
              <select id="state" name="state" value={estado} onChange={e => setEstado(e.target.value)} className="w-full border border-border rounded px-3 py-2">
                <option value="">Selecione</option>
                {estados.map(est => (
                  <option key={est.sigla} value={est.sigla}>{est.sigla}</option>
                ))}
              </select>
            </div>
            <div className="w-3/4">
              <label htmlFor="city" className="block text-sm font-medium mb-1">Cidade</label>
              <input
                id="city"
                name="city"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                className="w-full border border-border rounded px-3 py-2"
                disabled={!estado}
                placeholder="Digite o nome da cidade"
              />
            </div>
          </div>
          {/* Endereço e Número */}
          <div className="flex gap-4">
            <div className="w-3/4">
              <label htmlFor="address" className="block text-sm font-medium mb-1">Endereço</label>
              <input id="address" name="address" type="text" defaultValue={org.address || ""} className="w-full border border-border rounded px-3 py-2" />
            </div>
            <div className="w-1/4">
              <label htmlFor="number" className="block text-sm font-medium mb-1">Número</label>
              <input id="number" name="number" type="text" defaultValue={org.number || ""} className="w-full border border-border rounded px-3 py-2" />
            </div>
          </div>
          {/* Email e Telefone */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail</label>
              <input id="email" name="email" type="email" defaultValue={org.email || ""} className="w-full border border-border rounded px-3 py-2" />
            </div>
            <div className="w-1/2">
              <label htmlFor="phone" className="block text-sm font-medium mb-1">Telefone</label>
              <input id="phone" name="phone" type="text" defaultValue={org.phone || ""} className="w-full border border-border rounded px-3 py-2" />
            </div>
          </div>
          {/* Cores */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label htmlFor="primaryColor" className="block text-sm font-medium mb-1">Cor Primária</label>
              <input id="primaryColor" name="primaryColor" type="color" defaultValue={org.primaryColor || "#000000"} className="w-16 h-8 border border-border rounded" />
            </div>
            <div className="w-1/2">
              <label htmlFor="secondaryColor" className="block text-sm font-medium mb-1">Cor Secundária</label>
              <input id="secondaryColor" name="secondaryColor" type="color" defaultValue={org.secondaryColor || "#ffffff"} className="w-16 h-8 border border-border rounded" />
            </div>
          </div>
          {/* Logo */}
          <div>
            <label htmlFor="logo" className="block text-sm font-medium mb-1">Logo (arquivo)</label>
            <input id="logo" name="logo" type="file" accept="image/*" className="w-full border border-border rounded px-3 py-2" />
            {org.logoUrl && (
              <img src={org.logoUrl} alt="Logo" className="mt-2 h-12" />
            )}
          </div>
          <div className="flex gap-2 mt-6">
            <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-foreground transition">Salvar</button>
            <Link href="/dashboard/organizations" className="px-4 py-2 rounded border border-border">Cancelar</Link>
          </div>
        </form>
      </div>

      {/* Coluna da Direita - Gerenciamento de Usuários */}
      <div className="w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Usuários da Empresa</h2>
          <button
            type="button"
            onClick={() => setShowLinkModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + Vincular Usuário
          </button>
        </div>

        {/* Lista de Usuários */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {orgUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum usuário vinculado ainda.</p>
          ) : (
            orgUsers.map(membership => (
              <div key={membership.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{membership.user.name}</h3>
                    <p className="text-sm text-gray-600">{membership.user.email}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                      membership.role === 'ADMIN' 
                        ? 'bg-red-100 text-red-800' 
                        : membership.role === 'USER'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {membership.role}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      membership.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {membership.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal para Vincular Usuário */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Vincular Usuário à Empresa</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Selecionar Usuário</label>
                <select 
                  value={selectedUser} 
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Selecione um usuário</option>
                  {allUsers
                    .filter(user => !orgUsers.some(orgUser => orgUser.user.id === user.id))
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select 
                  value={selectedRole} 
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="USER">Usuário</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="EXTERNAL">Externo</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={handleLinkUser}
                disabled={!selectedUser}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                Vincular
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLinkModal(false);
                  setSelectedUser('');
                  setSelectedRole('USER');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
