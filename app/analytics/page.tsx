'use client'

import { useState, useEffect } from "react"
import { LineChart, PieChart, BarChart3 } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import Insights from "./components/Insights"
import { SpendingTrends } from "./components/spending-trends"
import { type Transaction } from "../transactions/types"

export default function AnalyticsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate data fetching
        const fetchData = async () => {
            // For now, let's assume no data
            setLoading(false) // Set loading to false after fetching
        }
        fetchData()
    }, [])

    return (
        <PageLayout
            title="Analytics"
            subtitle="Analyze your spending patterns"
            isLoading={loading}
            isEmpty={transactions.length === 0}
            emptyState={{
                title: "No data to analyze",
                description: "Add some transactions to see detailed analytics of your spending patterns.",
                actionLabel: "Add Transaction",
                onAction: () => {/* Navigate to transactions */ },
                icons: [LineChart, PieChart, BarChart3]
            }}
        >
            <div className="grid gap-4">
                {/* Top row with spending trends and insights */}
                <div className="grid grid-cols-[1.8fr,0.5fr] gap-4">
                    {/* Spending Trends Chart */}
                    <SpendingTrends transactions={transactions} />

                    {/* Insights Cards */}
                    <Insights />
                </div>
            </div>
        </PageLayout>
    )
} 