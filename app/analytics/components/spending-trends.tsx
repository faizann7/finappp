"use client"

import { useState } from "react"
import { TrendingDown } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { format } from "date-fns"
import { type Transaction } from "../../transactions/types"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { categories } from "../../transactions/components/transaction-form" // Import categories

interface SpendingTrendsProps {
    transactions: Transaction[]
}

export function SpendingTrends({ transactions }: SpendingTrendsProps) {
    const [selectedRange, setSelectedRange] = useState<number>(6); // Default to last 6 months

    // Create a category map
    const categoryMap = categories.reduce((acc, category) => {
        acc[category.id] = category.name;
        return acc;
    }, {} as Record<string, string>);

    // Process transactions into monthly data
    const monthlyData = transactions.reduce((acc, transaction) => {
        const date = new Date(transaction.date)
        const monthKey = format(date, "MMM yyyy")

        if (!acc[monthKey]) {
            acc[monthKey] = { expenses: 0 }
        }

        if (transaction.type === "Expense") {
            acc[monthKey].expenses += transaction.amount
        }

        return acc
    }, {} as Record<string, { expenses: number }>)

    // Convert to array and sort by date
    const chartData = Object.entries(monthlyData)
        .map(([month, data]) => ({
            month,
            expenses: data.expenses,
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

    // Filter data based on selected range
    const filteredData = chartData.slice(-selectedRange);

    // Aggregate expenses by category
    const categoryData = transactions.reduce((acc, transaction) => {
        if (transaction.type === "Expense") {
            acc[transaction.categoryId] = (acc[transaction.categoryId] || 0) + transaction.amount;
        }
        return acc;
    }, {} as Record<string, number>);

    // Debugging: Log categoryMap and categoryData
    console.log("Category Map:", categoryMap);
    console.log("Category Data:", categoryData);

    // Calculate total expenses for percentages
    const totalExpenses = Object.values(categoryData).reduce((sum, amount) => sum + amount, 0);

    // Update pieChartData to include percentages
    const pieChartData = Object.entries(categoryData).map(([categoryId, amount]) => {
        const categoryName = categoryMap[categoryId] || "Unknown Category";
        const percentage = ((amount / totalExpenses) * 100).toFixed(1);
        return {
            name: categoryName,
            value: amount,
            percentage: `${percentage}%`,
        };
    });

    // Define colors for pie chart segments
    const pieColors = ["#1751D0", "#FF5733", "#33FF57", "#FFC300", "#DAF7A6"]; // Example colors

    const chartConfig = {
        expenses: {
            label: "Expenses",
            color: "#1751D0",
        }
    } satisfies ChartConfig

    return (
        <div className="grid grid-cols-[1.8fr,1fr] gap-4">
            <Card className="h-[458px]">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Monthly Expense Overview</CardTitle>
                            <CardDescription>Expenses Comparison</CardDescription>
                        </div>
                        <Select
                            onValueChange={(value) => setSelectedRange(Number(value))}
                            defaultValue={String(selectedRange)}
                        >
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Select Time Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">Last 3 Months</SelectItem>
                                <SelectItem value="6">Last 6 Months</SelectItem>
                                <SelectItem value="12">Last 12 Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <ChartContainer config={chartConfig}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={filteredData}
                                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                    tickFormatter={(value) => value.slice(0, 3)}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={({ active, payload }) => {
                                        if (!active || !payload) return null;
                                        const data = payload[0].payload;
                                        return (
                                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                                                <div className="grid gap-2">
                                                    <div className="font-medium">{data.month}</div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-red-600">Expenses:</span>
                                                        <span className="font-medium">
                                                            ${data.expenses.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                                <Bar
                                    dataKey="expenses"
                                    fill={chartConfig.expenses.color}
                                    radius={8}
                                >
                                    <LabelList
                                        dataKey="expenses"
                                        position="top"
                                        formatter={(value: number) => `$${value}`}
                                        offset={12}
                                        className="fill-foreground"
                                        fontSize={12}
                                    />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="h-[458px]">
                <CardHeader>
                    <CardTitle>Category Overview</CardTitle>
                    <CardDescription>Expenses by Category</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <ResponsiveContainer width="50%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={pieColors[index % pieColors.length]}
                                            strokeWidth={0}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>

                        <div className="flex-1 pl-8">
                            {pieChartData.map((entry, index) => (
                                <div key={`legend-${index}`} className="flex items-center gap-2 mb-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: pieColors[index % pieColors.length] }}
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{entry.name}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {entry.percentage}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 