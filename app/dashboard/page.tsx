'use client'

import { useState, useEffect } from "react"
import { BarChart, TrendingUp, PieChart } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function DashboardPage() {
  const [hasData, setHasData] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check for data here
    // For now, let's assume no data
    setHasData(false)
  }, [])

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Get an overview of your financial health"
      isLoading={loading}
      isEmpty={!hasData}
      emptyState={{
        title: "No data to display",
        description: "Add some accounts and transactions to see your financial insights here.",
        actionLabel: "Add Account",
        onAction: () => {/* Navigate to accounts page */ },
        icons: [BarChart, TrendingUp, PieChart]
      }}
    >
      {/* Dashboard content */}
    </PageLayout>
  )
} 