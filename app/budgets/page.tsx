'use client'

import { useState, useEffect } from "react"
import { Plus, PiggyBank, Wallet, Calculator } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PageLayout } from "@/components/page-layout"
import { BudgetForm } from "./components/budget-form"
import { BudgetsList } from "./components/budgets-list"
import { EmptyState } from "@/components/ui/empty-state"
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
                description: `${budget.name} has been updated successfully.`,
            })
        } else {
            saveBudgets([...budgets, budget])
            toast({
                title: "Budget Created",
                description: `${budget.name} has been created successfully.`,
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
                description: `${budgetToDelete.name} has been deleted.`,
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
            subtitle="Set and track your spending limits"
            isLoading={loading}
            isEmpty={budgets.length === 0}
            emptyState={{
                title: "No budgets set",
                description: "Create your first budget to start managing your spending.",
                actionLabel: "Create Budget",
                onAction: () => {
                    setEditingBudget(undefined)
                    setIsFormOpen(true)
                },
                icons: [PiggyBank, Wallet, Calculator]
            }}
            headerAction={!loading && budgets.length > 0 ? {
                label: "Create Budget",
                icon: <Plus className="mr-2 h-4 w-4" />,
                onClick: () => {
                    setEditingBudget(undefined)
                    setIsFormOpen(true)
                }
            } : undefined}
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