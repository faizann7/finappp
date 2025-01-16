export type Budget = {
    id: string
    category: string
    amount: number
    spent: number
    startDate?: string
    endDate?: string
}

export const SAMPLE_CATEGORIES = [
    "Food & Dining",
    "Rent & Housing",
    "Transportation",
    "Entertainment",
    "Shopping",
    "Healthcare",
    "Utilities",
    "Education",
    "Travel",
    "Other"
] 