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
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, isBefore } from "date-fns"
import { type Category } from "../categories/types"
import { useEffect } from "react"

const BUDGET_TYPE_OPTIONS = [
    { label: "Added Only", value: "added_only" },
    { label: "All Transactions", value: "all_transactions" },
] as const

const formSchema = z.object({
    name: z.string().min(1, "Budget name is required"),
    category: z.string().min(1, "Category is required"),
    amount: z.string().transform((val) => parseFloat(val)),
    timeframe: z.enum(["weekly", "monthly", "yearly", "custom"]),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
}).refine((data) => {
    if (data.startDate && data.endDate) {
        return !isBefore(data.endDate, data.startDate)
    }
    return true
}, {
    message: "End date cannot be earlier than start date",
    path: ["endDate"]
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
            timeframe: "custom",
            startDate: budget.startDate ? new Date(budget.startDate) : undefined,
            endDate: budget.endDate ? new Date(budget.endDate) : undefined,
        } : {
            name: "",
            category: "",
            amount: "0",
            timeframe: "monthly",
            startDate: startOfMonth(new Date()),
            endDate: endOfMonth(new Date()),
        },
    })

    const timeframe = form.watch("timeframe")

    useEffect(() => {
        const today = new Date()

        switch (timeframe) {
            case "weekly":
                form.setValue("startDate", today)
                form.setValue("endDate", addDays(today, 7))
                break
            case "monthly":
                form.setValue("startDate", startOfMonth(today))
                form.setValue("endDate", endOfMonth(today))
                break
            case "yearly":
                form.setValue("startDate", startOfYear(today))
                form.setValue("endDate", endOfYear(today))
                break
        }
    }, [timeframe, form])

    function handleSubmit(values: z.infer<typeof formSchema>) {
        onSubmit({
            id: budget?.id || crypto.randomUUID(),
            name: values.name,
            category: values.category,
            amount: values.amount,
            spent: budget?.spent || 0,
            startDate: values.startDate?.toISOString(),
            endDate: values.endDate?.toISOString(),
        })
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
                                <Input
                                    type="text"
                                    placeholder="Enter budget name"
                                    {...field}
                                />
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

                <FormField
                    control={form.control}
                    name="timeframe"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Timeframe</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select timeframe" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {TIMEFRAME_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {timeframe === "custom" && (
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
                                                    date < new Date("1900-01-01") ||
                                                    (form.getValues("startDate") && isBefore(date, form.getValues("startDate")))
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
                                                    date < new Date("1900-01-01") ||
                                                    (form.getValues("startDate") && isBefore(date, form.getValues("startDate")))
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