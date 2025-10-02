"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Clock } from "lucide-react"
import { format } from "date-fns"
import { useUserRoleAndOrg } from "@/lib/useUserRoleAndOrg"
import { Modal } from "@/components/ui/modal"

interface AttendanceFormProps {
  onSuccess?: () => void
}

export function AttendanceForm({ onSuccess }: AttendanceFormProps) {
  // ...existing code...
  // DEBUG: Exibir orgId e clientes no console para diagnóstico
  // Adicione este bloco após todos os hooks:
  // useEffect(() => {
  //   console.log('orgId:', orgId)
  //   console.log('clientes:', customers)
  // }, [orgId, customers])
  // Importar useRouter do Next.js
  // @ts-ignore
  const router = (typeof window !== 'undefined' && require('next/navigation').useRouter) ? require('next/navigation').useRouter() : null;
  // ...existing code...
  // ...existing code...
  // ...existing code...
  // Coloque este bloco após todos os hooks:
  // useEffect(() => {
  //   console.log('orgId:', orgId)
  //   console.log('clientes:', customers)
  // }, [orgId, customers])
  const { orgId } = useUserRoleAndOrg();
  const [supportMode, setSupportMode] = useState("")
  const [supportTypeId, setSupportTypeId] = useState("")
  const [supportTypes, setSupportTypes] = useState<Array<{ id: string; name: string }>>([])
  const [showAddType, setShowAddType] = useState(false)
  const [newTypeName, setNewTypeName] = useState("")
  const [notes, setNotes] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [customers, setCustomers] = useState<Array<{ id: string; name: string; cpfCnpj?: string; city?: string }>>([])
  const [showCustomerList, setShowCustomerList] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customerSearch, setCustomerSearch] = useState("")

  // Buscar orgId da empresa padrão (pode ser ajustado para empresa selecionada)
  useEffect(() => {
    if (!orgId) {
      console.log('AttendanceForm: orgId não disponível ainda:', orgId)
      return
    }
    
    console.log('AttendanceForm: Carregando dados para orgId:', orgId)
    
    async function fetchSupportTypes() {
      try {
        const res = await fetch(`/api/support-type?orgId=${orgId}`)
        const data = await res.json()
        if (res.ok) {
          setSupportTypes(data.types)
          console.log('Support types carregados:', data.types.length, 'tipos')
        }
      } catch (error) {
        console.error('Erro ao carregar support types:', error)
      }
    }
    fetchSupportTypes()
    
    async function fetchCustomers() {
      try {
        const res = await fetch(`/api/customers?org=${orgId}`)
        const data = await res.json()
        if (res.ok) {
          setCustomers(data.customers)
          console.log('Clientes carregados:', data.customers.length, 'clientes')
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
      }
    }
    fetchCustomers()
  }, [orgId])

  const handleQuickCheckIn = () => {
    const now = new Date()
    setCheckIn(format(now, "yyyy-MM-dd'T'HH:mm"))
  }

  const handleQuickCheckOut = () => {
    const now = new Date()
    setCheckOut(format(now, "yyyy-MM-dd'T'HH:mm"))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validação de data/hora
    if (!checkIn) {
      setError("Data e hora de entrada são obrigatórias")
      setIsLoading(false)
      return
    }

    if (checkOut && checkIn) {
      const entryDateTime = new Date(checkIn)
      const exitDateTime = new Date(checkOut)
      
      if (exitDateTime <= entryDateTime) {
        setError("A data e hora de saída deve ser posterior à data e hora de entrada")
        setIsLoading(false)
        return
      }
    }

    let finalCustomerId = customerId
    // Se não selecionou cliente, mas digitou nome
    if (!finalCustomerId && customerName.trim()) {
      // Verifica se já existe cliente com esse nome na empresa
      const existing = customers.find(c => c.name.toLowerCase() === customerName.trim().toLowerCase())
      if (existing) {
        finalCustomerId = existing.id
      } else {
        // Cria cliente básico
        const res = await fetch("/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: customerName.trim() })
        })
        const data = await res.json()
        if (res.ok && data.customer?.id) {
          finalCustomerId = data.customer.id
          setCustomers([...customers, data.customer])
        }
      }
    }

    try {
      const response = await fetch("/api/attendances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checkIn: new Date(checkIn).toISOString(),
          checkOut: checkOut ? new Date(checkOut).toISOString() : null,
          customerId: finalCustomerId || null,
          supportTypeId: supportTypeId || null,
          supportMode,
          notes,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Atendimento registrado com sucesso!")
        setCheckIn("")
        setCheckOut("")
        setCustomerId("")
        setCustomerName("")
        onSuccess?.()
      } else {
        setError(data.error || "Erro ao registrar atendimento")
      }
    } catch (error) {
      setError("Erro ao registrar atendimento. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Filtrar clientes por nome, cpf ou cidade
  const filteredCustomers = useMemo(() => {
    const term = customerSearch.trim().toLowerCase()
    if (!term) return customers
    return customers.filter(c =>
      c.name?.toLowerCase().includes(term) ||
      c.cpfCnpj?.toLowerCase().includes(term) ||
      c.city?.toLowerCase().includes(term)
    )
  }, [customerSearch, customers])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Registrar Atendimento
        </CardTitle>
        <CardDescription>Registre sua entrada e saída do trabalho</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Linha 1: Entrada e Saída */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="checkIn">Entrada</Label>
              <div className="flex space-x-2">
                <Input
                  id="checkIn"
                  type="datetime-local"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                  className="border-primary"
                />
                <Button type="button" variant="outline" className="border border-secondary" onClick={handleQuickCheckIn}>
                  Agora
                </Button>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="checkOut">
                Saída (opcional)
                {checkIn && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (deve ser após {checkIn.replace('T', ' ')})
                  </span>
                )}
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="checkOut"
                  type="datetime-local"
                  value={checkOut}
                  min={checkIn} // Define o mínimo como a data de entrada
                  onChange={(e) => {
                    const newCheckOut = e.target.value
                    setCheckOut(newCheckOut)
                    
                    // Validação em tempo real
                    if (checkIn && newCheckOut) {
                      const entryDateTime = new Date(checkIn)
                      const exitDateTime = new Date(newCheckOut)
                      
                      if (exitDateTime <= entryDateTime) {
                        setError("A data e hora de saída deve ser posterior à data e hora de entrada")
                      } else {
                        // Limpa o erro se a validação passou
                        if (error.includes("data e hora de saída deve ser posterior")) {
                          setError("")
                        }
                      }
                    }
                  }}
                  className={`border-primary ${
                    checkIn && checkOut && new Date(checkOut) <= new Date(checkIn) 
                      ? 'border-red-500 bg-red-50' 
                      : ''
                  }`}
                />
                <Button type="button" variant="outline" className="border border-secondary" onClick={handleQuickCheckOut}>
                  Agora
                </Button>
              </div>
            </div>
          </div>
          {/* Linha 2: Cliente */}
          <div className="space-y-2">
            <Label htmlFor="customerName">Cliente</Label>
            <div className="flex items-center gap-2">
              <Input
                id="customerName"
                type="text"
                placeholder="Digite o nome do cliente"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full border border-primary rounded px-2 py-2"
              />
              <Button
                type="button"
                variant="outline"
                className="border border-secondary"
                onClick={() => setShowCustomerModal(true)}
                title="Selecionar cliente já cadastrado"
              >
                Selecionar
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border border-secondary"
                onClick={() => {
                  if (router) router.push('/dashboard/customers');
                  else if (typeof window !== 'undefined') window.location.href = '/dashboard/customers';
                }}
                title="Adicionar novo cliente"
              >
                +
              </Button>
            </div>
            {/* Modal de seleção de cliente */}
            <Modal open={showCustomerModal} onClose={() => setShowCustomerModal(false)}>
              <div className="p-4 bg-white rounded max-w-4xl mx-auto">
                <Input
                  type="text"
                  placeholder="Buscar por nome, CPF ou cidade"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="mb-4 border border-primary rounded px-2 py-2"
                />
                <div className="overflow-x-auto">
                  <table className="min-w-[600px] max-w-[900px] w-full border mx-auto">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-2 border">Nome</th>
                        <th className="px-4 py-2 border">CPF/CNPJ</th>
                        <th className="px-4 py-2 border">Cidade</th>
                        <th className="px-4 py-2 border">Selecionar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-muted-foreground">
                            { !orgId ? "Empresa não identificada. Verifique seu vínculo." : "Nenhum cliente encontrado para esta empresa." }
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map(c => (
                          <tr key={c.id}>
                            <td className="px-4 py-2 border">{c.name}</td>
                            <td className="px-4 py-2 border">{c.cpfCnpj || "-"}</td>
                            <td className="px-4 py-2 border">{c.city || "-"}</td>
                            <td className="px-4 py-2 border">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  setCustomerId(c.id)
                                  setCustomerName(c.name)
                                  setShowCustomerModal(false)
                                }}
                              >Selecionar</Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-right">
                  <Button type="button" variant="outline" className="border border-secondary" onClick={() => setShowCustomerModal(false)}>Fechar</Button>
                </div>
              </div>
            </Modal>
          </div>
          {/* Linha 3: Tipo de Atendimento */}
          <div className="space-y-2">
            <Label htmlFor="supportTypeId">Tipo de Atendimento</Label>
            <div className="flex items-center gap-2">
              <select
                id="supportTypeId"
                className="w-full border border-primary rounded px-2 py-2"
                value={supportTypeId}
                onChange={e => setSupportTypeId(e.target.value)}
                required
              >
                <option value="">Selecione...</option>
                {supportTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <Button type="button" variant="outline" className="border border-secondary" onClick={() => setShowAddType(true)} title="Adicionar novo tipo">+</Button>
            </div>
            {showAddType && (
              <div className="flex gap-2 mt-2">
                <Input
                  type="text"
                  placeholder="Novo tipo de atendimento"
                  value={newTypeName}
                  onChange={e => setNewTypeName(e.target.value)}
                  className="border-primary"
                />
                <Button
                  type="button"
                  className="border border-save bg-white text-[color:var(--button-save)] hover:bg-[color:var(--button-save)] hover:text-white transition-colors"
                  onClick={async () => {
                    if (newTypeName.length < 3) return
                    const res = await fetch("/api/support-type", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: newTypeName, orgId })
                    })
                    const data = await res.json()
                    if (res.ok) {
                      setSupportTypes([...supportTypes, data.type])
                      setSupportTypeId(data.type.id)
                      setNewTypeName("")
                      setShowAddType(false)
                    }
                  }}
                >Salvar</Button>
                <Button
                  type="button"
                  className="border border-cancel bg-white text-[color:var(--button-cancel)] hover:bg-[color:var(--button-cancel)] hover:text-white transition-colors"
                  onClick={() => setShowAddType(false)}
                >Cancelar</Button>
              </div>
            )}
          </div>
          {/* Linha 4: Modo de Suporte */}
          <div className="space-y-2">
            <Label htmlFor="supportMode">Modo de Suporte</Label>
            <select
              id="supportMode"
              className="w-full border border-primary rounded px-2 py-2"
              value={supportMode}
              onChange={e => setSupportMode(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              <option value="remoto">Remoto</option>
              <option value="presencial">Presencial</option>
            </select>
          </div>
          {/* Linha 5: Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <textarea
              id="notes"
              className="w-full border border-primary rounded px-2 py-2"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="Descreva detalhes do atendimento..."
            />
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
          <Button
            type="submit"
            size="lg"
            className="w-full px-8 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-xl focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            Registrar Atendimento
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
