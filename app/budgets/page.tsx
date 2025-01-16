'use client'

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PageLayout } from "@/components/page-layout"
import { BudgetForm } from "./components/budget-form"
import { BudgetsList } from "./components/budgets-list"
import { type Budget } from "./types"

const STORAGE_KEY = 'finance-tracker-budgets'

export default function BudgetsPage() {
    const { toast } = useToast()
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingBudget, setEditingBudget] = useState<Budget | undefined>()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            setBudgets(JSON.parse(stored))
        }
        setLoading(false)
    }, [])

    const saveBudgets = (newBudgets: Budget[]) => {
        setBudgets(newBudgets)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newBudgets))
    }

    const handleSubmit = (budget: Budget) => {
        if (editingBudget) {
            saveBudgets(
                budgets.map((b) => (b.id === budget.id ? budget : b))
            )
            toast({
                title: "Budget Updated",
                description: `${budget.category} budget has been updated successfully.`,
            })
        } else {
            saveBudgets([...budgets, budget])
            toast({
                title: "Budget Created",
                description: `${budget.category} budget has been created successfully.`,
            })
        }
        handleClose()
    }

    const handleEdit = (budget: Budget) => {
        setEditingBudget(budget)
        setIsFormOpen(true)
    }

    const handleDelete = (budgetId: string) => {
        const budgetToDelete = budgets.find(b => b.id === budgetId)
        if (budgetToDelete) {
            saveBudgets(budgets.filter((b) => b.id !== budgetId))
            toast({
                title: "Budget Deleted",
                description: `${budgetToDelete.category} budget has been deleted.`,
            })
        }
    }

    const handleClose = () => {
        setIsFormOpen(false)
        setEditingBudget(undefined)
    }

    return (
        <PageLayout
            title="Budgets"
            subtitle="Create and manage budgets to keep your spending on track"
            isLoading={loading}
            isEmpty={budgets.length === 0}
            emptyState={{
                title: "No budgets created",
                description: "Set up your first budget to start tracking spending.",
                actionLabel: "Add Budget",
                onAction: () => setIsFormOpen(true)
            }}
            headerAction={{
                label: "Add Budget",
                icon: <Plus className="mr-2 h-4 w-4" />,
                onClick: () => setIsFormOpen(true)
            }}
            dialog={{
                isOpen: isFormOpen,
                onOpenChange: setIsFormOpen,
                title: editingBudget ? 'Edit Budget' : 'Add Budget',
                content: (
                    <BudgetForm
                        budget={editingBudget}
                        onSubmit={handleSubmit}
                        onCancel={handleClose}
                    />
                )
            }}
        >
            <BudgetsList
                budgets={budgets}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </PageLayout>
    )
} 