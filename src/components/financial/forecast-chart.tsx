'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Line, ComposedChart } from "recharts"

export type ForecastData = {
    month: string
    implementation: number
    monthly: number
    expenses: number
    net: number
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
                <div className="h-[450px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data}>
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
                                formatter={(value: number, name: string) => [
                                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                                    name
                                ]}
                            />
                            <Legend
                                verticalAlign="top"
                                align="right"
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '0px', paddingBottom: '30px' }}
                            />
                            {showImplementation && (
                                <Bar
                                    dataKey="implementation"
                                    name="Receita Impl."
                                    fill="#10b981"
                                    stackId="revenue"
                                    opacity={0.8}
                                />
                            )}
                            {showMonthly && (
                                <Bar
                                    dataKey="monthly"
                                    name="Receita MRR"
                                    fill="#3b82f6"
                                    stackId="revenue"
                                    opacity={0.8}
                                />
                            )}
                            <Bar
                                dataKey="expenses"
                                name="Despesas"
                                fill="#ef4444"
                                radius={[4, 4, 0, 0]}
                                opacity={0.6}
                            />
                            <Line
                                type="monotone"
                                dataKey="net"
                                name="Resultado Líquido"
                                stroke="#f59e0b"
                                strokeWidth={3}
                                dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
