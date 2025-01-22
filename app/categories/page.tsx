'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PageLayout } from "@/components/page-layout"
import { CategoryForm } from "./components/category-form"
import { useToast } from "@/hooks/use-toast"
import { type Category } from "./types"
import { Plus, Tag, Folder, Tags, MoreHorizontal, Trash2, Edit, X, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Separator } from "@/components/ui/separator"
import { CategoriesTable } from "./components/categories-table"

const STORAGE_KEY = 'finance-tracker-categories'

export default function CategoriesPage() {
    const { toast } = useToast()
    const [categories, setCategories] = useState<Category[]>([])
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | undefined>()
    const [loading, setLoading] = useState(true)
    const [deletingCategory, setDeletingCategory] = useState<Category | undefined>()

    // State for Bulk Delete
    const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([])

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

    // Handle form submission for adding/updating categories
    const handleSubmit = (category: Category) => {
        const existingCategory = categories.find(c => c.name.toLowerCase() === category.name.toLowerCase() && c.type === category.type)
        if (existingCategory && existingCategory.id !== category.id) {
            toast({ title: "Error", description: "Category name must be unique within the same type." })
            return
        }

        if (editingCategory) {
            const updatedCategories = categories.map(c => (c.id === category.id ? category : c))
            saveCategories(updatedCategories)
            toast({ title: "Success", description: `${category.name} has been updated successfully.` })
        } else {
            saveCategories([...categories, { ...category, id: crypto.randomUUID() }])
            toast({ title: "Success", description: `${category.name} has been created successfully.` })
        }
        handleClose()
    }

    // Handle editing a category
    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        setIsFormOpen(true)
    }

    // Handle deleting a category
    const handleDeleteClick = (category: Category) => {
        setDeletingCategory(category)
    }

    const handleDeleteConfirm = () => {
        if (deletingCategory) {
            const updatedCategories = categories.filter(c => c.id !== deletingCategory.id)
            saveCategories(updatedCategories)
            toast({
                title: "Success",
                description: `${deletingCategory.name} has been deleted.`,
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

    // Handle bulk deletion
    const handleBulkDelete = (categoryIds: string[]) => {
        setBulkDeleteIds(categoryIds)
    }

    const confirmBulkDelete = () => {
        if (bulkDeleteIds.length > 0) {
            const updatedCategories = categories.filter(c => !bulkDeleteIds.includes(c.id))
            saveCategories(updatedCategories)
            toast({
                title: "Success",
                description: `${bulkDeleteIds.length} category(ies) have been deleted.`,
            })
            setBulkDeleteIds([])
        }
    }

    const cancelBulkDelete = () => {
        setBulkDeleteIds([])
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
            <CategoriesTable
                data={categories}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onBulkDelete={handleBulkDelete}
            />

            {/* Single Delete Confirmation Dialog */}
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

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog
                open={bulkDeleteIds.length > 0}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        cancelBulkDelete()
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Categories</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {bulkDeleteIds.length} selected categor{bulkDeleteIds.length > 1 ? "ies" : "y"}? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelBulkDelete}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmBulkDelete}
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