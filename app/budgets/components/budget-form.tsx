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
import { SAMPLE_CATEGORIES, type Budget } from "../types"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, isBefore, addMonths, endOfMonth as endOfMonthFns, startOfMonth as startOfMonthFns, addYears } from "date-fns"
import { type Category } from "../categories/types"
import { useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { generateRecurringBudgets } from "../utils/budget-utils"

const BUDGET_TYPE_OPTIONS = [
    { label: "Added Only", value: "added_only" },
    { label: "All Transactions", value: "all_transactions" },
] as const

const formSchema = z.object({
    name: z.string().min(1, "Budget name is required"),
    category: z.string().min(1, "Category is required"),
    amount: z.string().transform((val) => parseFloat(val)),
    startDate: z.date(),
    isRecurring: z.boolean().default(false),
    numberOfMonths: z.number().min(1).max(12).optional(),
    budgetType: z.enum(["added_only", "all_transactions"]).default("all_transactions"),
})

const TIMEFRAME_OPTIONS = [
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
    { label: "Yearly", value: "yearly" },
    { label: "Custom", value: "custom" },
] as const

const BUDGET_TEMPLATES = [
    {
        name: "50/30/20 Budget",
        categories: [
            { name: "Needs (50%)", percentage: 50 },
            { name: "Wants (30%)", percentage: 30 },
            { name: "Savings (20%)", percentage: 20 }
        ]
    },
    {
        name: "Zero-Based Budget",
        categories: [
            { name: "Housing", percentage: 25 },
            { name: "Transportation", percentage: 15 },
            { name: "Food", percentage: 15 },
            // ... other categories
        ]
    }
]

interface BudgetFormProps {
    budget?: Budget
    categories: Category[]
    onSubmit: (data: Budget) => void
    onCancel: () => void
}

export function BudgetForm({ budget, categories, onSubmit, onCancel }: BudgetFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: budget ? {
            name: budget.name,
            category: budget.category,
            amount: budget.amount.toString(),
            startDate: budget.startDate ? new Date(budget.startDate) : new Date(),
            isRecurring: false,
            numberOfMonths: undefined,
            budgetType: budget.budgetType,
        } : {
            name: "",
            category: "",
            amount: "0",
            startDate: new Date(),
            isRecurring: false,
            numberOfMonths: undefined,
            budgetType: "all_transactions",
        },
    })

    function handleSubmit(values: z.infer<typeof formSchema>) {
        if (values.isRecurring && values.numberOfMonths) {
            const templateBudget = {
                id: budget?.id || crypto.randomUUID(),
                name: values.name,
                category: values.category,
                amount: values.amount,
                spent: 0,
                budgetType: values.budgetType,
            };

            const recurringBudgets = generateRecurringBudgets(
                templateBudget,
                values.startDate,
                values.numberOfMonths
            );

            onSubmit(recurringBudgets);
        } else {
            // Single budget
            const endDate = values.isRecurring && values.numberOfMonths
                ? addMonths(values.startDate, values.numberOfMonths)
                : endOfMonth(values.startDate);

            onSubmit({
                id: budget?.id || crypto.randomUUID(),
                name: values.name,
                category: values.category,
                amount: values.amount,
                spent: budget?.spent || 0,
                startDate: startOfMonth(values.startDate).toISOString(),
                endDate: endDate.toISOString(),
                budgetType: values.budgetType,
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Budget Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter budget name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="divider" disabled>
                                        ─────────────
                                    </SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.name}>
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
                                <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                                                format(field.value, "MMMM yyyy")
                                            ) : (
                                                <span>Pick a month</span>
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
                                        disabled={(date) => date > addYears(new Date(), 1)}
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
                    name="isRecurring"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel>Create recurring budget</FormLabel>
                        </FormItem>
                    )}
                />

                {form.watch("isRecurring") && (
                    <FormField
                        control={form.control}
                        name="numberOfMonths"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Number of Months</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="12"
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        value={field.value}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {budget ? 'Update' : 'Create'} Budget
                    </Button>
                </div>
            </form>
        </Form>
    )
} 