"use client";
import React from "react";
import Link from "next/link";

export default function NewOrganizationPage() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/organizations", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      window.location.href = "/dashboard/organizations";
    } else {
      alert("Erro ao cadastrar empresa");
    }
  };

  // Estados e cidades para select dinâmico
  const estados = [
    { sigla: "AC", nome: "Acre" }, { sigla: "AL", nome: "Alagoas" }, { sigla: "AP", nome: "Amapá" }, { sigla: "AM", nome: "Amazonas" }, { sigla: "BA", nome: "Bahia" }, { sigla: "CE", nome: "Ceará" }, { sigla: "DF", nome: "Distrito Federal" }, { sigla: "ES", nome: "Espírito Santo" }, { sigla: "GO", nome: "Goiás" }, { sigla: "MA", nome: "Maranhão" }, { sigla: "MT", nome: "Mato Grosso" }, { sigla: "MS", nome: "Mato Grosso do Sul" }, { sigla: "MG", nome: "Minas Gerais" }, { sigla: "PA", nome: "Pará" }, { sigla: "PB", nome: "Paraíba" }, { sigla: "PR", nome: "Paraná" }, { sigla: "PE", nome: "Pernambuco" }, { sigla: "PI", nome: "Piauí" }, { sigla: "RJ", nome: "Rio de Janeiro" }, { sigla: "RN", nome: "Rio Grande do Norte" }, { sigla: "RS", nome: "Rio Grande do Sul" }, { sigla: "RO", nome: "Rondônia" }, { sigla: "RR", nome: "Roraima" }, { sigla: "SC", nome: "Santa Catarina" }, { sigla: "SP", nome: "São Paulo" }, { sigla: "SE", nome: "Sergipe" }, { sigla: "TO", nome: "Tocantins" }
  ];
  const [estado, setEstado] = React.useState("");
  const [cidade, setCidade] = React.useState("");
  const [cidades, setCidades] = React.useState<string[]>([]);
  const [empresas, setEmpresas] = React.useState<any[]>([]);

  // Exemplo: cidades por estado (pode ser expandido)
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

  React.useEffect(() => {
    fetch("/api/organizations").then(res => res.json()).then(data => setEmpresas(data));
  }, []);

  React.useEffect(() => {
    setCidades(cidadesPorEstado[estado] || []);
    setCidade("");
  }, [estado]);

  return (
    <div className="flex gap-8 p-8">
      {/* Coluna esquerda: cadastro */}
      <div className="w-1/2">
        <h1 className="text-2xl font-bold mb-4">Cadastrar Nova Empresa</h1>
        <form className="space-y-4" onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Nome da Empresa</label>
            <input id="name" name="name" type="text" required className="w-full border border-border rounded px-3 py-2" />
          </div>
          {/* CNPJ e IE */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label htmlFor="cnpj" className="block text-sm font-medium mb-1">CNPJ</label>
              <input id="cnpj" name="cnpj" type="text" className="w-full border border-border rounded px-3 py-2" />
            </div>
            <div className="w-1/4">
              <label htmlFor="ie" className="block text-sm font-medium mb-1">IE</label>
              <input id="ie" name="ie" type="text" className="w-full border border-border rounded px-2 py-2" />
            </div>
            <div className="w-1/4">
              <label htmlFor="cep" className="block text-sm font-medium mb-1">CEP</label>
              <input id="cep" name="cep" type="text" className="w-full border border-border rounded px-2 py-2" />
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
              <input id="address" name="address" type="text" className="w-full border border-border rounded px-3 py-2" />
            </div>
            <div className="w-1/4">
              <label htmlFor="number" className="block text-sm font-medium mb-1">Número</label>
              <input id="number" name="number" type="text" className="w-full border border-border rounded px-3 py-2" />
            </div>
          </div>
          {/* Email e Telefone */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail</label>
              <input id="email" name="email" type="email" className="w-full border border-border rounded px-3 py-2" />
            </div>
            <div className="w-1/2">
              <label htmlFor="phone" className="block text-sm font-medium mb-1">Telefone</label>
              <input id="phone" name="phone" type="text" className="w-full border border-border rounded px-3 py-2" />
            </div>
          </div>
          {/* Cores */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label htmlFor="primaryColor" className="block text-sm font-medium mb-1">Cor Primária</label>
              <input id="primaryColor" name="primaryColor" type="color" className="w-16 h-8 border border-border rounded" />
            </div>
            <div className="w-1/2">
              <label htmlFor="secondaryColor" className="block text-sm font-medium mb-1">Cor Secundária</label>
              <input id="secondaryColor" name="secondaryColor" type="color" className="w-16 h-8 border border-border rounded" />
            </div>
          </div>
          {/* Logo */}
          <div>
            <label htmlFor="logo" className="block text-sm font-medium mb-1">Logo (arquivo)</label>
            <input id="logo" name="logo" type="file" accept="image/*" className="w-full border border-border rounded px-3 py-2" />
          </div>
          <div className="flex gap-2 mt-6">
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 hover:scale-105 transition-all font-semibold">Cadastrar</button>
            <Link href="/dashboard/organizations" className="px-4 py-2 rounded border border-border">Cancelar</Link>
          </div>
        </form>
      </div>
      {/* Coluna direita: empresas cadastradas */}
      <div className="w-1/2">
        <h2 className="text-xl font-bold mb-4">Empresas Cadastradas</h2>
        <div className="space-y-4">
          {empresas.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma empresa cadastrada ainda.</p>
          ) : (
            empresas.map(org => (
              <div key={org.id} className="border rounded p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold">{org.name}</div>
                  <div className="text-xs text-muted-foreground">CNPJ: {org.cnpj}</div>
                  <div className="text-xs text-muted-foreground">Cidade: {org.city || "-"}</div>
                </div>
                <Link href={`/dashboard/organizations/edit/${org.id}`} className="text-primary underline">Editar</Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
