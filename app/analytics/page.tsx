'use client'

import { useState, useEffect } from "react"
import { LineChart, PieChart, BarChart3 } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function AnalyticsPage() {
    const [hasData, setHasData] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate data fetching
        const fetchData = async () => {
            // Fetch your data here
            // For now, let's assume no data
            setHasData(false)
            setLoading(false) // Set loading to false after fetching
        }
        fetchData()
    }, [])

    return (
        <PageLayout
            title="Analytics"
            subtitle="Analyze your spending patterns"
            isLoading={loading}
            isEmpty={!hasData}
            emptyState={{
                title: "No data to analyze",
                description: "Add some transactions to see detailed analytics of your spending patterns.",
                actionLabel: "Add Transaction",
                onAction: () => {/* Navigate to transactions */ },
                icons: [LineChart, PieChart, BarChart3]
            }}
        >
            {/* Analytics content */}
        </PageLayout>
    )
} 