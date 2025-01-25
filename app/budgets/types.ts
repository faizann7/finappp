export type Budget = {
    id: string;
    name: string;
    category: string;
    amount: number;
    spent: number;
    startDate: string;
    endDate: string;
    isRecurring?: boolean;
    parentBudgetId?: string;
    budgetType: "added_only" | "all_transactions";
};

export type BudgetAnalytics = {
    totalBudgeted: number;
    totalSpent: number;
    remainingBudget: number;
    spendingTrend: number; // Percentage increase/decrease from previous period
    forecastedSpending: number;
    categoryBreakdown: {
        category: string;
        budgeted: number;
        spent: number;
        percentage: number;
    }[];
};

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