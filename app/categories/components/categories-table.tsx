'use client'

import { useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, MoreHorizontal, Edit, Trash2, X } from "lucide-react"
import { format } from "date-fns"
import { type Category } from "../types"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface CategoriesTableProps {
    data: Category[]
    onEdit: (category: Category) => void
    onDelete: (category: Category) => void
    onBulkDelete?: (categoryIds: string[]) => void
}

export function CategoriesTable({
    data,
    onEdit,
    onDelete,
    onBulkDelete,
}: CategoriesTableProps) {
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("")

    // Filter categories based on search term and type
    const filteredData = data.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = typeFilter === "" || category.type === typeFilter
        return matchesSearch && matchesType
    })

    const handleBulkDelete = () => {
        if (selectedRows.length > 0) {
            onBulkDelete?.(selectedRows)
            setSelectedRows([])
        }
    }

    const isFilterActive = () => {
        return searchTerm !== "" || typeFilter !== ""
    }

    const clearFilters = () => {
        setSearchTerm("")
        setTypeFilter("")
    }

    return (
        <div className="space-y-4">
            {/* Filters Row */}
            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2">
                    {/* Search Input */}
                    <input
                        type="text"
                        placeholder="Filter categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 w-[150px] lg:w-[250px] border rounded px-2"
                    />

                    {/* Type Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 border-dashed flex items-center">
                                <span>Type</span>
                                {typeFilter && (
                                    <>
                                        <Separator orientation="vertical" className="mx-2 h-4" />
                                        <Badge
                                            variant="secondary"
                                            className="rounded-sm px-1 font-normal"
                                        >
                                            {typeFilter}
                                        </Badge>
                                    </>
                                )}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTypeFilter("")}>
                                All Types
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTypeFilter("Expense")}>
                                Expense
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTypeFilter("Income")}>
                                Income
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Reset Filters */}
                    {isFilterActive() && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 px-2 lg:px-3 flex items-center"
                        >
                            Reset
                            <X className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Bulk Delete Button */}
                {selectedRows.length > 0 && (
                    <Button
                        variant="outline"
                        onClick={handleBulkDelete}
                        className="gap-2 h-8 flex items-center"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Selected ({selectedRows.length})
                    </Button>
                )}
            </div>

            {/* Categories Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Checkbox
                                    checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedRows(filteredData.map(category => category.id))
                                        } else {
                                            setSelectedRows([])
                                        }
                                    }}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead>Category Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedRows.includes(category.id)}
                                        onCheckedChange={() => {
                                            setSelectedRows(prev => {
                                                if (prev.includes(category.id)) {
                                                    return prev.filter(id => id !== category.id)
                                                } else {
                                                    return [...prev, category.id]
                                                }
                                            })
                                        }}
                                        aria-label={`Select category ${category.name}`}
                                    />
                                </TableCell>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-foreground">
                                        {category.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onEdit(category)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDelete(category)}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}