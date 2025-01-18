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
import { type Category } from "../types"

const formSchema = z.object({
    name: z.string().min(1, "Category name is required"),
    type: z.enum(["Expense", "Income"]),
})

interface CategoryFormProps {
    category?: Category
    onSubmit: (data: Category) => void
    onCancel: () => void
}

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: category ? { name: category.name, type: category.type } : { name: "", type: "Expense" },
    })

    function handleSubmit(values: z.infer<typeof formSchema>) {
        onSubmit({ id: category?.id || crypto.randomUUID(), ...values })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Enter category name" />
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
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Expense">Expense</SelectItem>
                                    <SelectItem value="Income">Income</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-4">
                    <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">{category ? 'Update' : 'Add'} Category</Button>
                </div>
            </form>
        </Form>
    )
}