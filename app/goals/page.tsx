'use client'

import { useState, useEffect } from "react"
import { Plus, Target, Trophy, Flag } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function GoalsPage() {
    const [goals, setGoals] = useState([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Load goals data here
        setGoals([]) // For now, empty array
    }, [])

    return (
        <PageLayout
            title="Financial Goals"
            subtitle="Track your financial objectives"
            isLoading={loading}
            isEmpty={goals.length === 0}
            emptyState={{
                title: "No goals set",
                description: "Set your first financial goal to start working towards your dreams.",
                actionLabel: "Set Goal",
                onAction: () => setIsFormOpen(true),
                icons: [Target, Trophy, Flag]
            }}
            headerAction={goals.length > 0 ? {
                label: "Set Goal",
                icon: <Plus className="mr-2 h-4 w-4" />,
                onClick: () => setIsFormOpen(true)
            } : undefined}
        >
            {/* Goals list component */}
        </PageLayout>
    )
} 