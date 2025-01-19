'use client'

import { useState } from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
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
import { type Budget } from "../types"
import { format } from "date-fns"

interface BudgetsListProps {
    budgets: Budget[]
    onEdit: (budget: Budget) => void
    onDelete: (budgetId: string) => void
    categories: { id: string; name: string }[]
}

export function BudgetsList({ budgets, onEdit, onDelete, categories = [] }: BudgetsListProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null)

    const handleDelete = () => {
        if (deleteId) {
            onDelete(deleteId)
            setDeleteId(null)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
    }

    const calculateProgress = (spent: number, total: number) => {
        return Math.min((spent / total) * 100, 100)
    }

    // Calculate monthly totals
    const calculateMonthlyTotals = () => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        return budgets.reduce((totals, budget) => {
            const startDate = budget.startDate ? new Date(budget.startDate) : null;
            const endDate = budget.endDate ? new Date(budget.endDate) : null;

            // Check if budget is active in current month
            const isActive = (!startDate || (
                startDate.getMonth() <= currentMonth &&
                startDate.getFullYear() <= currentYear
            )) && (!endDate || (
                endDate.getMonth() >= currentMonth &&
                endDate.getFullYear() >= currentYear
            ));

            if (isActive) {
                return {
                    totalBudget: totals.totalBudget + budget.amount,
                    totalSpent: totals.totalSpent + budget.spent
                };
            }
            return totals;
        }, { totalBudget: 0, totalSpent: 0 });
    };

    const monthlyTotals = calculateMonthlyTotals();
    const isOverTotalBudget = monthlyTotals.totalSpent > monthlyTotals.totalBudget;
    const totalProgressValue = calculateProgress(monthlyTotals.totalSpent, monthlyTotals.totalBudget);

    return (
        <div className="space-y-6">
            {/* Monthly Overview Card */}
            <Card className={`hover:shadow-lg transition-shadow duration-200 ${isOverTotalBudget ? 'bg-red-100' : 'bg-blue-50'}`}>
                <CardHeader>
                    <CardTitle className="text-lg font-medium">
                        Monthly Overview - {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">
                        {formatCurrency(monthlyTotals.totalBudget)}
                    </div>
                    <div className="mt-4 space-y-2">
                        <Progress
                            value={totalProgressValue}
                            className={`h-3 ${isOverTotalBudget ? 'bg-red-500' : 'bg-blue-500'}`}
                        />
                        <div className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">
                                {formatCurrency(monthlyTotals.totalSpent)}
                            </span>
                            {" spent of "}
                            {formatCurrency(monthlyTotals.totalBudget)}
                        </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium">Remaining: </span>
                        {formatCurrency(monthlyTotals.totalBudget - monthlyTotals.totalSpent)}
                    </div>
                    {isOverTotalBudget && (
                        <div className="mt-2 text-red-600 text-sm font-medium">
                            Warning: Total spending has exceeded the monthly budget!
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Individual Budget Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {budgets.map((budget) => {
                    const category = categories.find(cat => cat.id === budget.category);
                    const categoryName = category ? category.name : "Unknown";

                    const isOverBudget = budget.spent > budget.amount;
                    const progressValue = calculateProgress(budget.spent, budget.amount);

                    return (
                        <Card key={budget.id} className={`hover:shadow-lg transition-shadow duration-200 ${isOverBudget ? 'bg-red-100' : ''}`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {categoryName}
                                </CardTitle>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(budget)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => setDeleteId(budget.id)}
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(budget.amount)}
                                </div>
                                <div className="mt-4 space-y-2">
                                    <Progress
                                        value={progressValue}
                                        className={`h-2 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                                    />
                                    <div className="text-xs text-muted-foreground">
                                        <span className="font-medium text-foreground">
                                            {formatCurrency(budget.spent)}
                                        </span>
                                        {" spent of "}
                                        {formatCurrency(budget.amount)}
                                    </div>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">
                                    <span className="font-medium">Remaining: </span>
                                    {formatCurrency(budget.amount - budget.spent)}
                                </div>
                                {isOverBudget && (
                                    <div className="mt-2 text-red-600 text-sm">
                                        Warning: This budget is over its limit!
                                    </div>
                                )}
                                {(budget.startDate || budget.endDate) && (
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        {budget.startDate && (
                                            <div>From: {format(new Date(budget.startDate), "PPP")}</div>
                                        )}
                                        {budget.endDate && (
                                            <div>To: {format(new Date(budget.endDate), "PPP")}</div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            budget and its data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                            Delete Budget
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
} 