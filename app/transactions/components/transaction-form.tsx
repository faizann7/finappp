'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
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
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { CalendarIcon, Plus, Minus, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { type Transaction, type TransactionFormData } from "../types"
import { type Account } from "../../accounts/types"
import { type Category } from "../../categories/types"
import { type Budget } from "../../budgets/types"
import { useState, useEffect, useRef } from "react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"

const formSchema = z.object({
    date: z.date(),
    accountId: z.string().min(1, "Account is required"),
    type: z.enum(["Income", "Expense", "Transfer"]),
    categoryId: z.string().min(1, "Category is required"),
    description: z.string().optional(),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    budgetId: z.string().optional(),
    isRecurring: z.boolean().default(false),
    recurrenceFrequency: z.enum(["Daily", "Weekly", "Monthly", "Yearly"]).optional(),
    recurrenceEndDate: z.date().optional(),
    subItems: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        amount: z.number().min(0.01, "Amount must be greater than 0"),
        status: z.enum(["Paid", "Owed"]).default("Paid"),
    })).optional(),
})

interface TransactionFormProps {
    transaction?: Transaction
    accounts: Account[]
    categories: Category[]
    budgets: Budget[]
    onSubmit: (data: TransactionFormData) => void
    onCancel: () => void
}

export function TransactionForm({
    transaction,
    accounts,
    categories,
    budgets,
    onSubmit,
    onCancel,
}: TransactionFormProps) {
    const [showBreakdown, setShowBreakdown] = useState(false)
    const [subItemsTotal, setSubItemsTotal] = useState(0)
    const [originalAmount, setOriginalAmount] = useState(transaction?.amount || 0)
    const [isInitializing, setIsInitializing] = useState(true)
    const firstInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: transaction ? {
            date: new Date(transaction.date),
            accountId: transaction.accountId,
            type: transaction.type,
            categoryId: transaction.categoryId,
            description: transaction.description,
            amount: transaction.amount,
            budgetId: transaction.budgetId,
            isRecurring: transaction.isRecurring,
            recurrenceFrequency: transaction.recurrenceFrequency,
            recurrenceEndDate: transaction.recurrenceEndDate ? new Date(transaction.recurrenceEndDate) : undefined,
            subItems: transaction.subItems || [],
        } : {
            date: new Date(),
            type: "Expense",
            amount: 0,
            isRecurring: false,
            subItems: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "subItems",
    })

    // Initialize breakdown if transaction has subItems
    useEffect(() => {
        if (transaction?.subItems?.length) {
            setShowBreakdown(true)
            const total = transaction.subItems.reduce((sum, item) => sum + item.amount, 0)
            setSubItemsTotal(total)
        }
        setIsInitializing(false)
    }, [transaction])

    // Calculate remaining balance for breakdown
    const remainingBalance = Math.max(0, form.getValues("amount") - subItemsTotal)
    const hasReachedTotal = Math.abs(form.getValues("amount") - subItemsTotal) < 0.01
    const exceedsTotal = subItemsTotal > form.getValues("amount")

    // Watch for amount changes to recalculate validation
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "amount" && showBreakdown) {
                const newAmount = value.amount as number
                const total = (value.subItems as any[])?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0

                if (Math.abs(newAmount - total) > 0.01) {
                    form.setError("amount", {
                        type: "manual",
                        message: `Warning: The new amount ($${newAmount.toFixed(2)}) doesn't match the breakdown total ($${total.toFixed(2)}).`,
                    })
                } else {
                    form.clearErrors("amount")
                }
            }
        })
        return () => subscription.unsubscribe()
    }, [form, showBreakdown])

    // Get validation message based on totals
    const getValidationMessage = () => {
        const amount = form.getValues("amount")
        if (exceedsTotal) {
            return `The breakdown total ($${subItemsTotal.toFixed(2)}) exceeds the transaction amount ($${amount.toFixed(2)}). Please adjust.`
        }
        if (!hasReachedTotal && subItemsTotal > 0) {
            return `The breakdown total ($${subItemsTotal.toFixed(2)}) is less than the transaction amount ($${amount.toFixed(2)}). Please adjust.`
        }
        return null
    }

    // Toggle breakdown with proper state management
    const toggleBreakdown = (isOpen: boolean) => {
        if (isOpen) {
            const currentAmount = form.getValues("amount")
            if (currentAmount <= 0) {
                form.setError("amount", {
                    type: "manual",
                    message: "Please enter a transaction amount before adding breakdown.",
                })
                return
            }
            setOriginalAmount(currentAmount)
            setShowBreakdown(true)
            if (fields.length === 0) {
                append({ id: crypto.randomUUID(), name: "", amount: 0, status: "Paid" })
            }
            setTimeout(() => {
                firstInputRef.current?.focus()
            }, 100)
        } else {
            const confirmed = window.confirm(
                "Removing the breakdown will clear all breakdown items. Do you want to continue?"
            )
            if (confirmed) {
                setShowBreakdown(false)
                form.setValue("subItems", [])
                form.setValue("amount", originalAmount)
                setSubItemsTotal(0)
            }
        }
    }

    // Handle amount field changes
    const handleAmountChange = (value: number) => {
        if (!showBreakdown) {
            setOriginalAmount(value)
        }
        form.setValue("amount", value)
    }

    // Validate form submission
    function handleSubmit(values: z.infer<typeof formSchema>) {
        if (showBreakdown) {
            const validationMessage = getValidationMessage()
            if (validationMessage) {
                form.setError("amount", {
                    type: "manual",
                    message: validationMessage,
                })
                return
            }

            if (values.subItems?.length === 0) {
                const confirmed = window.confirm(
                    `No breakdown items added. The transaction will have a total of $${values.amount.toFixed(2)}. Do you want to continue?`
                )
                if (!confirmed) return
            }
        } else if (values.amount <= 0) {
            form.setError("amount", {
                type: "manual",
                message: "Amount must be greater than 0",
            })
            return
        }

        // Ensure subItems are properly formatted before submission
        const formattedValues = {
            ...values,
            id: transaction?.id,
            subItems: showBreakdown ? values.subItems?.map(item => ({
                ...item,
                amount: Number(item.amount),
            })) : undefined,
        }

        onSubmit(formattedValues)
    }

    if (isInitializing) {
        return <div className="p-8 text-center">Loading transaction details...</div>
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="max-w-[40rem] space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Transaction Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select transaction type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Income">Income</SelectItem>
                                        <SelectItem value="Expense">Expense</SelectItem>
                                        <SelectItem value="Transfer">Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
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
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date) => {
                                                field.onChange(date)
                                            }}
                                            disabled={(date) => date < new Date("1900-01-01")}
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
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex justify-between items-center">
                                    <FormLabel>Amount</FormLabel>
                                    {showBreakdown && (
                                        <span className="text-xs text-muted-foreground">
                                            Automatically calculated from breakdown
                                        </span>
                                    )}
                                </div>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="1"
                                        {...field}
                                        onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
                                        disabled={showBreakdown}
                                        className={cn(
                                            showBreakdown && "bg-muted cursor-not-allowed",
                                            exceedsTotal && "border-destructive"
                                        )}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="accountId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Account</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an account" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {accounts.map((account) => (
                                            <SelectItem key={account.id} value={account.id}>
                                                {account.name}
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
                        name="categoryId"
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
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter description" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Recurring Transaction Section */}
                <FormField
                    control={form.control}
                    name="isRecurring"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Recurring Transaction</FormLabel>
                                <p className="text-sm text-muted-foreground">
                                    Each occurrence will include the specified breakdown
                                </p>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                {/* Breakdown Section */}
                <Collapsible
                    open={showBreakdown}
                    onOpenChange={toggleBreakdown}
                    className="space-y-4 border rounded-lg p-4 bg-muted/5"
                >
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="text-sm font-semibold">Transaction Breakdown</h4>
                            <div className="text-sm space-y-1">
                                <p className={cn(
                                    "font-medium",
                                    exceedsTotal ? "text-destructive" :
                                        hasReachedTotal ? "text-success" :
                                            "text-muted-foreground"
                                )}>
                                    Total: ${subItemsTotal.toFixed(2)}
                                    {subItemsTotal > 0 && (
                                        <span className="ml-2">
                                            {getValidationMessage() ? (
                                                <span className="text-destructive">
                                                    ({getValidationMessage()})
                                                </span>
                                            ) : (
                                                hasReachedTotal && <span>(Matched)</span>
                                            )}
                                        </span>
                                    )}
                                </p>
                                {!hasReachedTotal && !exceedsTotal && (
                                    <p className="text-muted-foreground">
                                        Remaining: ${remainingBalance.toFixed(2)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" size="sm">
                                {showBreakdown ? "Remove" : "Add"} Breakdown
                            </Button>
                        </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="space-y-4 mt-4 max-h-[40vh] overflow-y-auto">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-4 items-start p-3 rounded-lg border bg-background">
                                <FormField
                                    control={form.control}
                                    name={`subItems.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Item name"
                                                    ref={index === 0 ? firstInputRef : undefined}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`subItems.${index}.amount`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                    placeholder="Amount"
                                                    className={cn(
                                                        Math.abs(form.getValues("amount") - subItemsTotal) > 0.01 && "border-destructive"
                                                    )}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`subItems.${index}.status`}
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Paid">Paid</SelectItem>
                                                        <SelectItem value="Owed">Owed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    disabled={fields.length === 1}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                {field.status === "Owed" && (
                                    <span className="text-red-500">Loan Indicator</span>
                                )}
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => append({ id: crypto.randomUUID(), name: "", amount: 0, status: "Paid" })}
                            className="w-full"
                            disabled={hasReachedTotal || exceedsTotal}
                        >
                            {hasReachedTotal ?
                                "Breakdown total has reached the transaction amount" :
                                "Add Item"
                            }
                        </Button>
                    </CollapsibleContent>
                </Collapsible>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button type="submit">
                        {transaction ? 'Update' : 'Add'} Transaction
                    </Button>
                </div>
            </form>
        </Form>
    )
} 