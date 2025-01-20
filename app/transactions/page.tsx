'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PageLayout } from "@/components/page-layout"
import { TransactionForm } from "./components/transaction-form"
import { DataTable } from "@/components/ui/data-table"
import { useToast } from "@/hooks/use-toast"
import { type Transaction } from "./types"
import { type Account } from "../accounts/types"
import { type Category } from "../categories/types"
import { type Budget } from "../budgets/types"
import { Plus, Wallet, Receipt, CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"
import { TransactionsTable } from "./components/transactions-table"

const STORAGE_KEY = 'finance-tracker-transactions'
const ACCOUNTS_KEY = 'finance-tracker-accounts'
const CATEGORIES_KEY = 'finance-tracker-categories'
const BUDGETS_KEY = 'finance-tracker-budgets'

export default function TransactionsPage() {
    const { toast } = useToast()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [accounts, setAccounts] = useState<Account[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>()
    const [deletingTransaction, setDeletingTransaction] = useState<Transaction | undefined>()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = () => {
            const storedTransactions = localStorage.getItem(STORAGE_KEY)
            const storedAccounts = localStorage.getItem(ACCOUNTS_KEY)
            const storedCategories = localStorage.getItem(CATEGORIES_KEY)
            const storedBudgets = localStorage.getItem(BUDGETS_KEY)

            if (storedTransactions) setTransactions(JSON.parse(storedTransactions))
            if (storedAccounts) setAccounts(JSON.parse(storedAccounts))
            if (storedCategories) setCategories(JSON.parse(storedCategories))
            if (storedBudgets) setBudgets(JSON.parse(storedBudgets))

            setLoading(false)
        }

        loadData()
    }, [])

    const saveTransactions = (newTransactions: Transaction[]) => {
        setTransactions(newTransactions)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions))
    }

    const handleSubmit = (transaction: Transaction) => {
        console.log("Submitting transaction:", transaction);

        if (editingTransaction) {
            const updatedTransactions = transactions.map(t => {
                if (t.id === editingTransaction.id) {
                    return {
                        ...transaction,
                        id: editingTransaction.id,
                        updatedAt: new Date().toISOString(),
                        createdAt: editingTransaction.createdAt,
                    };
                }
                return t;
            });

            console.log("Updated transactions:", updatedTransactions);
            saveTransactions(updatedTransactions);
            toast({
                title: "Success",
                description: "Transaction has been updated successfully.",
            });
        } else {
            const newTransaction = {
                ...transaction,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            saveTransactions([...transactions, newTransaction]);
            toast({
                title: "Success",
                description: "Transaction has been added successfully.",
            });
        }
        handleClose();
    }

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction)
        setIsFormOpen(true)
    }

    const handleDeleteClick = (transaction: Transaction) => {
        setDeletingTransaction(transaction)
    }

    const handleDeleteConfirm = () => {
        if (deletingTransaction) {
            saveTransactions(transactions.filter((t) => t.id !== deletingTransaction.id))
            toast({
                title: "Success",
                description: "Transaction has been deleted.",
            })
            setDeletingTransaction(undefined)
        }
    }

    const handleDeleteCancel = () => {
        setDeletingTransaction(undefined)
    }

    const handleClose = () => {
        setIsFormOpen(false)
        setEditingTransaction(undefined)
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
    }

    const getAccountName = (accountId: string) => {
        return accounts.find(a => a.id === accountId)?.name || 'Unknown Account'
    }

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || 'Unknown Category'
    }

    const getBudgetName = (budgetId?: string) => {
        if (!budgetId) return undefined
        return budgets.find(b => b.id === budgetId)?.category
    }

    const updateBudget = (updatedBudget: Budget) => {
        setBudgets((prevBudgets) =>
            prevBudgets.map((budget) =>
                budget.id === updatedBudget.id ? updatedBudget : budget
            )
        );
        localStorage.setItem(BUDGETS_KEY, JSON.stringify(
            budgets.map(b => b.id === updatedBudget.id ? updatedBudget : b)
        ));
    }

    const handleCategoryAdd = (categoryName: string, categoryType: "Income" | "Expense") => {
        const newCategory = {
            id: crypto.randomUUID(),
            name: categoryName,
            type: categoryType,
            color: "#000000",
        }

        const updatedCategories = [...categories, newCategory]
        setCategories(updatedCategories)
        localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories))

        toast({
            title: "Category Created",
            description: `${categoryName} has been created successfully.`,
        })
    }

    const handleBudgetAdd = (budgetData: Omit<Budget, 'id'>) => {
        const newBudget = {
            ...budgetData,
            id: crypto.randomUUID(),
        }

        const updatedBudgets = [...budgets, newBudget]
        setBudgets(updatedBudgets)
        localStorage.setItem(BUDGETS_KEY, JSON.stringify(updatedBudgets))

        toast({
            title: "Budget Created",
            description: `${budgetData.name} has been created successfully.`,
        })
    }

    return (
        <PageLayout
            title="Transactions"
            subtitle="Track your income and expenses"
            isLoading={loading}
            isEmpty={transactions.length === 0}
            emptyState={{
                title: "No transactions recorded",
                description: "Add your first transaction to get started.",
                actionLabel: "Add Transaction",
                onAction: () => setIsFormOpen(true),
                icons: [Wallet, Receipt, CreditCard]
            }}
            headerAction={!loading && transactions.length > 0 ? {
                label: "Add Transaction",
                icon: <Plus className="mr-2 h-4 w-4" />,
                onClick: () => setIsFormOpen(true)
            } : undefined}
            dialog={{
                isOpen: isFormOpen,
                onOpenChange: setIsFormOpen,
                title: editingTransaction ? 'Edit Transaction' : 'Add Transaction',
                content: (
                    <TransactionForm
                        transaction={editingTransaction}
                        accounts={accounts}
                        categories={categories}
                        budgets={budgets}
                        onSubmit={handleSubmit}
                        onCancel={handleClose}
                        updateBudget={updateBudget}
                        onCategoryAdd={handleCategoryAdd}
                        onBudgetAdd={handleBudgetAdd}
                    />
                )
            }}
        >
            <TransactionsTable
                data={transactions}
                accounts={accounts}
                categories={categories}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            <AlertDialog
                open={!!deletingTransaction}
                onOpenChange={(isOpen) => !isOpen && setDeletingTransaction(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this transaction? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleDeleteCancel}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageLayout>
    )
} 