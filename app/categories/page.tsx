'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PageLayout } from "@/components/page-layout"
import { CategoryForm } from "./components/category-form"
import { DataTable } from "@/components/ui/data-table"
import { useToast } from "@/hooks/use-toast"
import { type Category } from "./types"
import { Plus, Tag, Folder, Tags } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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

const STORAGE_KEY = 'finance-tracker-categories'

export default function CategoriesPage() {
    const { toast } = useToast()
    const [categories, setCategories] = useState<Category[]>([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | undefined>()
    const [loading, setLoading] = useState(true)
    const [deletingCategory, setDeletingCategory] = useState<Category | undefined>()

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            setCategories(JSON.parse(stored))
        }
        setLoading(false)
    }, [])

    const saveCategories = (newCategories: Category[]) => {
        setCategories(newCategories)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newCategories))
    }

    const handleSubmit = (category: Category) => {
        const existingCategory = categories.find(c => c.name === category.name && c.type === category.type);
        if (existingCategory && existingCategory.id !== category.id) {
            toast({ title: "Error", description: "Category name must be unique within the same type." })
            return;
        }

        if (editingCategory) {
            saveCategories(
                categories.map(c => (c.id === category.id ? category : c))
            )
            toast({ title: "Success", description: `${category.name} has been updated successfully.` })
        } else {
            saveCategories([...categories, { ...category, id: crypto.randomUUID() }])
            toast({ title: "Success", description: `${category.name} has been created successfully.` })
        }
        handleClose()
    }

    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        setIsFormOpen(true)
    }

    const handleDeleteClick = (category: Category) => {
        setDeletingCategory(category)
    }

    const handleDeleteConfirm = () => {
        if (deletingCategory) {
            saveCategories(categories.filter((c) => c.id !== deletingCategory.id))
            toast({
                title: "Success",
                description: `${deletingCategory.name} has been deleted.`
            })
            setDeletingCategory(undefined)
        }
    }

    const handleDeleteCancel = () => {
        setDeletingCategory(undefined)
    }

    const handleClose = () => {
        setIsFormOpen(false)
        setEditingCategory(undefined)
    }

    return (
        <PageLayout
            title="Categories"
            subtitle="Manage your transaction categories"
            isLoading={loading}
            isEmpty={categories.length === 0}
            emptyState={{
                title: "No categories found",
                description: "Add a category to start organizing your transactions.",
                actionLabel: "Add Category",
                onAction: () => setIsFormOpen(true),
                icons: [Tag, Folder, Tags]
            }}
            headerAction={!loading && categories.length > 0 ? {
                label: "Add Category",
                icon: <Plus className="mr-2 h-4 w-4" />,
                onClick: () => setIsFormOpen(true)
            } : undefined}
            dialog={{
                isOpen: isFormOpen,
                onOpenChange: setIsFormOpen,
                title: editingCategory ? 'Edit Category' : 'Add Category',
                content: (
                    <CategoryForm
                        category={editingCategory}
                        onSubmit={handleSubmit}
                        onCancel={handleClose}
                    />
                )
            }}
        >
            <DataTable
                data={categories}
                columns={[
                    { accessor: 'name', header: 'Category Name' },
                    {
                        accessor: 'type',
                        header: 'Type',
                        Cell: ({ row }: { row: { original: Category } }) => (
                            <Badge variant="outline">
                                {row.original.type}
                            </Badge>
                        )
                    },
                    {
                        accessor: 'actions',
                        header: 'Actions',
                        Cell: ({ row }: { row: { original: Category } }) => (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(row.original)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteClick(row.original)}
                                >
                                    Delete
                                </Button>
                            </div>
                        )
                    }
                ]}
            />

            <AlertDialog
                open={!!deletingCategory}
                onOpenChange={(isOpen) => !isOpen && setDeletingCategory(undefined)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deletingCategory?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleDeleteCancel}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </PageLayout>
    )
}