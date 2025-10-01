"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Users } from "lucide-react";

export default function CustomersPage() {
  const [name, setName] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState("");
  const [cpfCnpj, setCpfCnpj] = useState("");
  const [ie, setIe] = useState(""); // novo campo IE
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [cep, setCep] = useState("");
  const [obs, setObs] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [preferredContact, setPreferredContact] = useState("");
  const [lastContactedAt, setLastContactedAt] = useState("");
  const [customFields, setCustomFields] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; email: string }>>([]);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch("/api/customers")
      .then(res => res.json())
      .then(data => setCustomers(data.customers || []));
  }, [success, refreshKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tipoPessoa,
          cpfCnpj,
          ie,
          phone1,
          phone2,
          address,
          number,
          neighborhood,
          city,
          state,
          cep,
          obs,
          tags,
          preferredContact,
          lastContactedAt,
          customFields
        })
      });
      if (res.ok) {
        setSuccess("Cliente cadastrado com sucesso!");
        setName("");
        setTipoPessoa("");
        setCpfCnpj("");
        setIe("");
        setPhone1("");
        setPhone2("");
        setAddress("");
        setNumber("");
        setNeighborhood("");
        setCity("");
        setState("");
        setCep("");
        setObs("");
        setTags([]);
        setPreferredContact("");
        setLastContactedAt("");
        setCustomFields("");
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao cadastrar cliente.");
      }
    } catch {
      setError("Erro ao cadastrar cliente. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-8 min-h-screen flex flex-col md:flex-row gap-8 items-stretch justify-center">
      {/* Card de cadastro à esquerda */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center items-stretch">
        <Card className="w-full h-full flex flex-col justify-center">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-primary" />
              <CardTitle>Cadastrar Cliente</CardTitle>
            </div>
            <CardDescription>Registre um novo cliente no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Primeira linha: nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome <span className="text-red-500">*</span></Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} required aria-required="true" className="border-primary" />
              </div>
              {/* Segunda linha: tipoPessoa, cpfCnpj, IE */}
              <div className="flex gap-4">
                <div className="w-1/3 space-y-2">
                  <Label htmlFor="tipoPessoa">Tipo de Pessoa</Label>
                  <select id="tipoPessoa" value={tipoPessoa} onChange={e => setTipoPessoa(e.target.value)} className="border border-primary border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm">
                    <option value="">Selecione...</option>
                    <option value="FISICA">Física</option>
                    <option value="JURIDICA">Jurídica</option>
                  </select>
                </div>
                <div className="w-1/3 space-y-2">
                  <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                  <Input id="cpfCnpj" value={cpfCnpj} onChange={e => setCpfCnpj(e.target.value)} className="border-primary" />
                </div>
                <div className="w-1/3 space-y-2">
                  <Label htmlFor="ie">IE</Label>
                  <Input id="ie" value={ie} onChange={e => setIe(e.target.value)} className="border-primary" />
                </div>
              </div>
              {/* Terceira linha: estado, cidade e cep */}
              <div className="flex gap-4">
                <div className="w-1/5 space-y-2">
                  <Label htmlFor="state" >Estado</Label>
                  <select
                    id="state"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="border border-primary border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] md:text-sm"
                  >
                    <option value="">Selecione...</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>
                <div className="w-3/5 space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" value={city} onChange={e => setCity(e.target.value)} className="border-primary" />
                </div>
                <div className="w-1/5 space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" value={cep} onChange={e => setCep(e.target.value)} className="border-primary" />
                </div>
              </div>
              {/* Quarta linha: endereço, bairro e número (ajuste visual) */}
              <div className="flex gap-2">
                <div className="w-3/5 min-w-0 space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" value={address} onChange={e => setAddress(e.target.value)} className="border-primary" />
                </div>
                <div className="w-3/5 min-w-0 space-y-2">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input id="neighborhood" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className="border-primary" />
                </div>
                <div className="w-1/5 min-w-0 space-y-2">
                  <Label htmlFor="number">Número</Label>
                  <Input id="number" value={number} onChange={e => setNumber(e.target.value)} className="border-primary" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obs">Observações</Label>
                <Input id="obs" value={obs} onChange={e => setObs(e.target.value)} className="w-full border border-primary rounded px-2 py-2" />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col md:flex-row gap-2 w-full">
                <Button
                  type="submit"
                  className="w-full px-8 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xl focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Cadastrar Cliente"}
                </Button>
                
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      {/* Card de listagem à direita */}
      <div className="w-full md:w-1/2 h-full flex flex-col overflow-y-auto">
        <Card className="w-full h-full flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle>Histórico de Clientes</CardTitle>
            </div>
            <CardDescription>Seus registros de clientes cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <span className="text-muted-foreground">Nenhum cliente cadastrado ainda.</span>
                <Button
                  type="button"
                  className="px-8 py-2 rounded font-semibold bg-[color:var(--button-primary)] text-white hover:bg-[color:var(--button-primary)]/90 transition-all"
                  onClick={() => setRefreshKey(k => k + 1)}
                >
                  Atualizar
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {customers.map(c => (
                  <li key={c.id} className="border rounded p-3 flex flex-col">
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{c.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
