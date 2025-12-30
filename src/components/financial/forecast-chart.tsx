'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"

export type ForecastData = {
    month: string
    implementation: number
    monthly: number
}

interface ForecastChartProps {
    data: ForecastData[]
    viewType?: "IMPLEMENTATION" | "MONTHLY" | "TOTAL"
}

export function ForecastChart({ data, viewType = "TOTAL" }: ForecastChartProps) {
    const showImplementation = viewType === "TOTAL" || viewType === "IMPLEMENTATION"
    const showMonthly = viewType === "TOTAL" || viewType === "MONTHLY"

    return (
        <Card className="col-span-4 transition-all hover:shadow-lg bg-card/50 backdrop-blur-sm border-primary/10">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Fluxo de Caixa Projetado</CardTitle>
                <CardDescription>
                    Visualização de faturamento {viewType === "IMPLEMENTATION" ? "focada em Implementação" : viewType === "MONTHLY" ? "focada em Mensalidades" : "consolidada"}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis
                                dataKey="month"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `R$ ${value / 1000}k`}
                                dx={-10}
                            />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                }}
                                formatter={(value: number) => [
                                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                                    ""
                                ]}
                            />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '0px', paddingBottom: '20px' }}
                            />
                            {showImplementation && (
                                <Bar
                                    dataKey="implementation"
                                    name="Implementação"
                                    fill="#10b981"
                                    radius={showMonthly ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                                    stackId="a"
                                />
                            )}
                            {showMonthly && (
                                <Bar
                                    dataKey="monthly"
                                    name="Mensalidade"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    stackId="a"
                                />
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
