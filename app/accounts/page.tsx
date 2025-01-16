'use client'

import { useState, useEffect } from "react"
import { Plus, Wallet, Link, Files } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PageLayout } from "@/components/page-layout"
import { AccountForm } from "./components/account-form"
import { AccountsList } from "./components/accounts-list"
import { EmptyState } from "@/components/ui/empty-state"
import { type Account } from "./types"

const STORAGE_KEY = 'finance-tracker-accounts'

export default function AccountsPage() {
    const { toast } = useToast()
    const [accounts, setAccounts] = useState<Account[]>([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingAccount, setEditingAccount] = useState<Account | undefined>()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            setAccounts(JSON.parse(stored))
        }
        setLoading(false)
    }, [])

    const saveAccounts = (newAccounts: Account[]) => {
        setAccounts(newAccounts)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAccounts))
    }

    const handleSubmit = (account: Account) => {
        if (editingAccount) {
            saveAccounts(
                accounts.map((a) => (a.id === account.id ? account : a))
            )
            toast({
                title: "Account Updated",
                description: `${account.name} has been updated successfully.`,
            })
        } else {
            saveAccounts([...accounts, account])
            toast({
                title: "Account Created",
                description: `${account.name} has been created successfully.`,
            })
        }
        handleClose()
    }

    const handleEdit = (account: Account) => {
        setEditingAccount(account)
        setIsFormOpen(true)
    }

    const handleDelete = (accountId: string) => {
        const accountToDelete = accounts.find(a => a.id === accountId)
        if (accountToDelete) {
            saveAccounts(accounts.filter((a) => a.id !== accountId))
            toast({
                title: "Account Deleted",
                description: `${accountToDelete.name} has been deleted.`,
            })
        }
    }

    const handleClose = () => {
        setIsFormOpen(false)
        setEditingAccount(undefined)
    }

    return (
        <PageLayout
            title="Accounts"
            subtitle="Manage your financial accounts"
            isLoading={loading}
            isEmpty={accounts.length === 0}
            emptyState={{
                title: "No accounts added",
                description: "Add your first account to start tracking your finances.",
                actionLabel: "Add Account",
                onAction: () => setIsFormOpen(true),
                icons: [Wallet, Link, Files]
            }}
            headerAction={!loading && accounts.length > 0 ? {
                label: "Add Account",
                icon: <Plus className="mr-2 h-4 w-4" />,
                onClick: () => setIsFormOpen(true)
            } : undefined}
            dialog={{
                isOpen: isFormOpen,
                onOpenChange: setIsFormOpen,
                title: editingAccount ? 'Edit Account' : 'Add Account',
                content: (
                    <AccountForm
                        account={editingAccount}
                        onSubmit={handleSubmit}
                        onCancel={handleClose}
                    />
                )
            }}
        >
            <AccountsList
                accounts={accounts}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </PageLayout>
    )
} 