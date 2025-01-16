'use client'

import { useState, useEffect } from "react"
import { Brain, Lightbulb, Sparkles } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function AIInsightsPage() {
    const [insights, setInsights] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate data fetching
        const fetchData = async () => {
            // Fetch your data here
            // For now, let's assume no insights
            setInsights([]) // Set to empty array
            setLoading(false) // Set loading to false after fetching
        }
        fetchData()
    }, [])

    return (
        <PageLayout
            title="AI Insights"
            subtitle="Get smart recommendations for your finances"
            isLoading={loading}
            isEmpty={insights.length === 0}
            emptyState={{
                title: "No insights available",
                description: "Add some transactions and accounts to receive AI-powered financial insights.",
                actionLabel: "Add Account",
                onAction: () => {/* Navigate to accounts */ },
                icons: [Brain, Lightbulb, Sparkles]
            }}
        >
            {/* AI Insights content */}
        </PageLayout>
    )
} 