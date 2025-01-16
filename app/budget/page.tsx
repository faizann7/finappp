'use client'

import { useState } from "react"
import { Plus, PiggyBank, Wallet, Calculator } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function BudgetPage() {
    const [budgets, setBudgets] = useState([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [loading, setLoading] = useState(true)

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