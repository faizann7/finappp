'use client'

import { useState } from "react"
import { PieChart, BarChart3, LineChart, Plus, Wallet, Banknote, Coins } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function TransactionsPage() {
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [transactions, setTransactions] = useState([]) // Add your transactions state

    return (
        <PageLayout
            title="Transactions"
            subtitle="View and manage all your financial transactions in one place"
            isEmpty={transactions.length === 0} // Replace with actual state
            emptyState={{
                title: "No transactions yet",
                description: "Add your first transaction to start tracking your spending.",
                actionLabel: "Add Transaction",
                onAction: () => setIsFormOpen(true),
                icons: [Banknote, Wallet, Coins]
            }}
            headerAction={transactions.length > 0 ? {
                label: "Add Transaction",
                icon: <Plus className="mr-2 h-4 w-4" />,
                onClick: () => setIsFormOpen(true)
            } : undefined}
        >
            {/* Add your transactions list component here */}
        </PageLayout>
    )
} 