'use client'

import { useState, useEffect } from "react"
import { Plus, PiggyBank, Wallet, Calculator } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { type Budget } from "./types"

const STORAGE_KEY = 'finance-tracker-budgets'

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            setBudgets(JSON.parse(stored))
        }
    }, [])

    return (
        <PageLayout
            title="Budgets"
            subtitle="Set and track your spending limits"
            isLoading={loading}
            isEmpty={budgets.length === 0}
            emptyState={{
                title: "No budgets set",
                description: "Create your first budget to start managing your spending.",
                actionLabel: "Create Budget",
                onAction: () => setIsFormOpen(true),
                icons: [PiggyBank, Wallet, Calculator]
            }}
            headerAction={budgets.length > 0 ? {
                label: "Create Budget",
                icon: <Plus className="mr-2 h-4 w-4" />,
                onClick: () => setIsFormOpen(true)
            } : undefined}
        >
            {/* Budget list component */}
        </PageLayout>
    )
} 