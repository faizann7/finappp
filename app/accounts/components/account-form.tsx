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
import { ACCOUNT_TYPES, CURRENCIES, type Account } from "../types"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Account name must be at least 2 characters.",
    }),
    type: z.string(),
    balance: z.string().transform((val) => parseFloat(val)),
    currency: z.string(),
})

interface AccountFormProps {
    account?: Account
    onSubmit: (data: Account) => void
    onCancel: () => void
}

export function AccountForm({ account, onSubmit, onCancel }: AccountFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: account ? {
            name: account.name,
            type: account.type,
            balance: account.balance.toString(),
            currency: account.currency,
        } : {
            name: "",
            type: "Bank",
            balance: "0",
            currency: "USD",
        },
    })

    function handleSubmit(values: z.infer<typeof formSchema>) {
        onSubmit({
            id: account?.id || crypto.randomUUID(),
            ...values,
        })
    }

    const handleCancel = (e: React.MouseEvent) => {
        e.preventDefault()
        onCancel()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter account name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Account Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {ACCOUNT_TYPES.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
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
                    name="balance"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Initial Balance</FormLabel>
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
                    name="currency"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {CURRENCIES.map((currency) => (
                                        <SelectItem key={currency.value} value={currency.value}>
                                            {currency.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                    <Button type="submit">
                        {account ? 'Update' : 'Create'} Account
                    </Button>
                </div>
            </form>
        </Form>
    )
} 