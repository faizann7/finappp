'use client'

import { useState } from "react"
import { Plus } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function TransactionsPage() {
    const [isFormOpen, setIsFormOpen] = useState(false)

    return (
        <PageLayout
            title="Transactions"
            subtitle="View and manage all your financial transactions in one place"
            isEmpty={true} // Replace with actual state
            emptyState={{
                title: "No transactions yet",
                description: "Add your first transaction to start tracking your spending.",
                actionLabel: "Add Transaction",
                onAction: () => setIsFormOpen(true)
            }}
            headerAction={{
                label: "Add Transaction",
                icon: <Plus className="mr-2 h-4 w-4" />,
                onClick: () => setIsFormOpen(true)
            }}
        >
            {/* Add your transactions list component here */}
        </PageLayout>
    )
} 