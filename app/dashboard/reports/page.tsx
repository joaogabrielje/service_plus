"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Users, TrendingUp, Activity } from "lucide-react"
import { KPIDashboard } from "@/components/reports/kpi-dashboard"
import { ProductivityReport } from "@/components/reports/productivity-report"
import { CustomerAnalysis } from "@/components/reports/customer-analysis"

export default function ReportsPage() {
	const [activeTab, setActiveTab] = useState("kpi")

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
				<p className="text-muted-foreground">Análise detalhada de performance e atividades</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="kpi" className="flex items-center gap-2">
						<Activity className="h-4 w-4" />
						KPIs
					</TabsTrigger>
					<TabsTrigger value="productivity" className="flex items-center gap-2">
						<TrendingUp className="h-4 w-4" />
						Produtividade
					</TabsTrigger>
					<TabsTrigger value="customers" className="flex items-center gap-2">
						<Users className="h-4 w-4" />
						Clientes
					</TabsTrigger>
				</TabsList>

				<TabsContent value="kpi" className="space-y-6">
					<KPIDashboard />
				</TabsContent>

				<TabsContent value="productivity" className="space-y-6">
					<ProductivityReport />
				</TabsContent>

				<TabsContent value="customers" className="space-y-6">
					<CustomerAnalysis />
				</TabsContent>
			</Tabs>
		</div>
	)
}
