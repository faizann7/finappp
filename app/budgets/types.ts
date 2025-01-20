export type Budget = {
    id: string;
    name: string;
    category: string;
    amount: number;
    spent: number;
    startDate?: string;
    endDate?: string;
    timeframe: "weekly" | "monthly" | "yearly" | "custom";
    budgetType: "added_only" | "all_transactions";
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