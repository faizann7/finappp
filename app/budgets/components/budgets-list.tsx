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
import { MoreHorizontal, Pencil, Trash, CheckSquare } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
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
import { cn } from "@/lib/utils"

interface BudgetsListProps {
    budgets: Budget[]
    onEdit: (budget: Budget) => void
    onDelete: (budgetId: string | string[]) => void
}

export function BudgetsList({ budgets, onEdit, onDelete }: BudgetsListProps) {
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [selectedBudgets, setSelectedBudgets] = useState<Set<string>>(new Set())
    const [isBulkSelecting, setIsBulkSelecting] = useState(false)

    const handleDelete = () => {
        if (deleteId) {
            onDelete(deleteId)
            setDeleteId(null)
        }
    }

    const handleBulkDelete = () => {
        if (selectedBudgets.size > 0) {
            onDelete(Array.from(selectedBudgets))
            setSelectedBudgets(new Set())
            setIsBulkSelecting(false)
        }
    }

    const toggleBudgetSelection = (budgetId: string) => {
        const newSelection = new Set(selectedBudgets)
        if (newSelection.has(budgetId)) {
            newSelection.delete(budgetId)
        } else {
            newSelection.add(budgetId)
        }
        setSelectedBudgets(newSelection)
    }

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            const allBudgetIds = new Set(budgets.map(b => b.id));
            setSelectedBudgets(allBudgetIds);
        } else {
            setSelectedBudgets(new Set());
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

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="space-x-2">
                    {isBulkSelecting && (
                        <>
                            <Button
                                variant="destructive"
                                onClick={handleBulkDelete}
                                disabled={selectedBudgets.size === 0}
                            >
                                Delete Selected ({selectedBudgets.size})
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsBulkSelecting(false)
                                    setSelectedBudgets(new Set())
                                }}
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                    {!isBulkSelecting && (
                        <Button
                            variant="outline"
                            onClick={() => setIsBulkSelecting(true)}
                        >
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Select Multiple
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {isBulkSelecting && (
                    <div className="flex items-center mb-4">
                        <Checkbox
                            checked={selectedBudgets.size === budgets.length}
                            onCheckedChange={toggleSelectAll}
                        />
                        <span className="ml-2">Select All</span>
                    </div>
                )}
                {budgets.map((budget) => (
                    <Card key={budget.id} className={cn(
                        isBulkSelecting && "border-2",
                        selectedBudgets.has(budget.id) && "border-primary"
                    )}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center space-x-2">
                                {isBulkSelecting && (
                                    <Checkbox
                                        checked={selectedBudgets.has(budget.id)}
                                        onCheckedChange={() => toggleBudgetSelection(budget.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                )}
                                <CardTitle className="text-sm font-medium">
                                    {budget.name}
                                </CardTitle>
                            </div>
                            {!isBulkSelecting && (
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
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(budget.amount)}
                            </div>
                            <div className="mt-4 space-y-2">
                                <Progress
                                    value={calculateProgress(budget.spent, budget.amount)}
                                    className="h-2"
                                />
                                <div className="text-xs text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                        {formatCurrency(budget.spent)}
                                    </span>
                                    {" spent of "}
                                    {formatCurrency(budget.amount)}
                                </div>
                            </div>
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
                ))}
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the
                            selected budget(s) and their data.
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

            <AlertDialog
                open={isBulkSelecting && selectedBudgets.size > 0}
                onOpenChange={() => setSelectedBudgets(new Set())}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Multiple Budgets</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedBudgets.size} selected budgets?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete}>
                            Delete Budgets
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
} 