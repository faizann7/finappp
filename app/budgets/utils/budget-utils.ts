import { addMonths, format, startOfMonth, endOfMonth } from "date-fns";
import { Budget } from "../types";

export function generateRecurringBudgets(
    templateBudget: Budget,
    startDate: Date,
    numberOfMonths: number
): Budget[] {
    const budgets: Budget[] = [];
    const parentId = crypto.randomUUID();

    for (let i = 0; i < numberOfMonths; i++) {
        const currentMonth = addMonths(startDate, i);
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);

        budgets.push({
            ...templateBudget,
            id: crypto.randomUUID(),
            parentBudgetId: parentId,
            name: `${templateBudget.name} - ${format(currentMonth, 'MMMM yyyy')}`,
            startDate: monthStart.toISOString(),
            endDate: monthEnd.toISOString(),
            spent: 0,
        });
    }

    return budgets;
}

export function calculateBudgetAnalytics(budgets: Budget[]): BudgetAnalytics {
    // Implementation for budget analytics calculation
    // This would analyze spending patterns, calculate trends, and generate forecasts
    // ... implementation details ...
} 