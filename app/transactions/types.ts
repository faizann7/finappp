import { type Category } from "../categories/types"

export type TransactionType = "Income" | "Expense" | "Transfer"
export type RecurrenceFrequency = "Daily" | "Weekly" | "Monthly" | "Yearly"

export interface TransactionSubItem {
    id: string
    name: string
    amount: number
}

export interface Transaction {
    id: string
    date: string
    accountId: string
    type: TransactionType
    categoryId: string
    description?: string
    amount: number
    budgetId?: string
    isRecurring?: boolean
    recurrenceFrequency?: RecurrenceFrequency
    recurrenceEndDate?: string
    subItems?: TransactionSubItem[]
    createdAt: string
    updatedAt: string
}

export interface TransactionFormData {
    date: Date
    accountId: string
    type: TransactionType
    categoryId: string
    description?: string
    amount: number
    budgetId?: string
    isRecurring?: boolean
    recurrenceFrequency?: RecurrenceFrequency
    recurrenceEndDate?: Date
    subItems?: TransactionSubItem[]
} 