'use client'

import { useState, useEffect } from "react"
import { Plus, PiggyBank, Wallet, Calculator } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { BudgetForm } from "./components/budget-form"
import { BudgetsList } from "./components/budgets-list"
import { EmptyState } from "@/components/ui/empty-state"
import { NotificationDemo } from "@/components/ui/success-alert-with-button"
import { type Budget } from "./types"
import { type Category } from "@/app/categories/types"
import { SAMPLE_CATEGORIES } from "@/app/categories/types"
import { type Transaction } from "@/app/transactions/types"
console.log("SAMPLE_CATEGORIES:", SAMPLE_CATEGORIES); // Log to check the imported value

const STORAGE_KEY = 'finance-tracker-budgets'
const CATEGORIES_STORAGE_KEY = 'finance-tracker-categories'; // Key for categories in local storage
const TRANSACTIONS_STORAGE_KEY = 'finance-tracker-transactions'

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [categories, setCategories] = useState<Category[]>([]); // Initialize as empty
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingBudget, setEditingBudget] = useState<Budget | undefined>()
    const [loading, setLoading] = useState(true)
    const [showSuccess, setShowSuccess] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const [transactions, setTransactions] = useState<Transaction[]>([])

    useEffect(() => {
        // Fetch budgets from local storage
        const storedBudgets = localStorage.getItem(STORAGE_KEY);
        if (storedBudgets) {
            setBudgets(JSON.parse(storedBudgets));
        }

        // Fetch categories from local storage
        const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (storedCategories) {
            setCategories(JSON.parse(storedCategories));
        } else {
            // Optionally set default categories if none are found
            setCategories(SAMPLE_CATEGORIES);
        }

        // Fetch transactions
        const storedTransactions = localStorage.getItem(TRANSACTIONS_STORAGE_KEY)
        if (storedTransactions) {
            setTransactions(JSON.parse(storedTransactions))
        }
        setLoading(false)
    }, [])

    const saveBudgets = (newBudgets: Budget[]) => {
        setBudgets(newBudgets)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newBudgets))
    }

    // Function to calculate spent amount for a budget
    const calculateSpentAmount = (categoryId: string, startDate?: string, endDate?: string) => {
        return transactions.reduce((total, transaction) => {
            if (transaction.categoryId !== categoryId) return total;

            const transactionDate = new Date(transaction.date);
            if (startDate && transactionDate < new Date(startDate)) return total;
            if (endDate && transactionDate > new Date(endDate)) return total;

            return total + transaction.amount;
        }, 0);
    }

    const handleSubmit = (budget: Budget) => {
        const selectedCategory = categories.find(cat => cat.id === budget.category);
        const categoryName = selectedCategory ? selectedCategory.name : "";

        // Calculate spent amount from existing transactions
        const spentAmount = calculateSpentAmount(
            budget.category,
            budget.startDate,
            budget.endDate
        );

        const budgetWithSpent = {
            ...budget,
            categoryName,
            spent: spentAmount
        };

        if (editingBudget) {
            const updatedBudgets = budgets.map((b) => (b.id === budget.id ? budgetWithSpent : b))
            saveBudgets(updatedBudgets)
            setSuccessMessage(`${categoryName} budget has been updated successfully.`)
        } else {
            const updatedBudgets = [...budgets, budgetWithSpent]
            saveBudgets(updatedBudgets)
            if (spentAmount > 0) {
                setSuccessMessage(
                    `${categoryName} budget has been created and updated with ${new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD'
                    }).format(spentAmount)
                    } from existing transactions.`
                )
            } else {
                setSuccessMessage(`${categoryName} budget has been created successfully.`)
            }
        }
        setShowSuccess(true)
        handleClose()

        setTimeout(() => {
            setShowSuccess(false)
        }, 2000)

        // Update the budgets state
        setBudgets(updatedBudgets)
    }

    const handleEdit = (budget: Budget) => {
        setEditingBudget(budget)
        setIsFormOpen(true)
    }

    const handleDelete = (budgetId: string) => {
        const budgetToDelete = budgets.find(b => b.id === budgetId)
        if (budgetToDelete) {
            const updatedBudgets = budgets.filter((b) => b.id !== budgetId)
            saveBudgets(updatedBudgets)

            // Update transactions to remove budget reference
            const updatedTransactions = transactions.map(transaction => ({
                ...transaction,
                budgetId: transaction.budgetId === budgetId ? undefined : transaction.budgetId
            }))
            localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(updatedTransactions))
            setTransactions(updatedTransactions)

            setSuccessMessage(`${budgetToDelete.categoryName} budget has been deleted.`)
            setShowSuccess(true)

            setTimeout(() => {
                setShowSuccess(false)
            }, 2000)

            // Update the budgets state
            setBudgets(updatedBudgets)
        }
    }

    const handleClose = () => {
        setIsFormOpen(false)
        setEditingBudget(undefined)
    }

    console.log("Categories:", categories); // Log categories to check their structure

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
                        categories={categories}
                        existingBudgets={budgets}
                        onSubmit={handleSubmit}
                        onCancel={handleClose}
                    />
                )
            }}
        >
            {showSuccess && (
                <NotificationDemo message={successMessage} onClose={() => setShowSuccess(false)} />
            )}
            <BudgetsList
                budgets={budgets}
                onEdit={handleEdit}
                onDelete={handleDelete}
                categories={categories}
            />
        </PageLayout>
    )
} 