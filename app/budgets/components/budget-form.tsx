'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { type Budget } from "../types"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { type Category } from "@/app/categories/types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState } from "react"

const formSchema = z.object({
    category: z.string().min(1, "Category is required"),
    amount: z.string().transform((val) => parseFloat(val)),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
})

interface BudgetFormProps {
    budget?: Budget
    categories: Category[]
    existingBudgets: Budget[]
    onSubmit: (data: Budget) => void
    onCancel: () => void
}

export function BudgetForm({ budget, categories = [], existingBudgets = [], onSubmit, onCancel }: BudgetFormProps) {
    const [validationError, setValidationError] = useState<string | null>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: budget ? {
            category: budget.category,
            amount: budget.amount.toString(),
            startDate: budget.startDate ? new Date(budget.startDate) : undefined,
            endDate: budget.endDate ? new Date(budget.endDate) : undefined,
        } : {
            category: "",
            amount: "0",
        },
    })

    // Check for overlapping budgets
    const checkOverlappingBudgets = (values: z.infer<typeof formSchema>) => {
        const newStartDate = values.startDate;
        const newEndDate = values.endDate;

        const overlappingBudget = existingBudgets.find(existingBudget => {
            if (existingBudget.id === budget?.id) return false; // Skip current budget when editing
            if (existingBudget.category !== values.category) return false;

            const existingStartDate = existingBudget.startDate ? new Date(existingBudget.startDate) : null;
            const existingEndDate = existingBudget.endDate ? new Date(existingBudget.endDate) : null;

            // If either budget doesn't have dates, they overlap
            if (!newStartDate || !newEndDate || !existingStartDate || !existingEndDate) return true;

            // Check for overlap
            return (existingStartDate <= newEndDate && existingEndDate >= newStartDate);
        });

        return overlappingBudget;
    }

    function handleSubmit(values: z.infer<typeof formSchema>) {
        // Reset validation error
        setValidationError(null);

        // Check for overlapping budgets
        const overlappingBudget = checkOverlappingBudgets(values);
        if (overlappingBudget) {
            setValidationError("A budget already exists for the selected category and time period.");
            return;
        }

        onSubmit({
            id: budget?.id || crypto.randomUUID(),
            category: values.category,
            amount: values.amount,
            spent: budget?.spent || 0,
            startDate: values.startDate?.toISOString(),
            endDate: values.endDate?.toISOString(),
        })
    }

    // Check if form should be disabled
    const isFormDisabled = categories.length === 0;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {validationError && (
                    <Alert variant="destructive">
                        <AlertDescription>{validationError}</AlertDescription>
                    </Alert>
                )}

                {categories.length === 0 && (
                    <Alert>
                        <AlertDescription>
                            No categories available. Please create a category first.
                        </AlertDescription>
                    </Alert>
                )}

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Budget Amount</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isFormDisabled}>
                        {budget ? 'Update' : 'Create'} Budget
                    </Button>
                </div>
            </form>
        </Form>
    )
} 