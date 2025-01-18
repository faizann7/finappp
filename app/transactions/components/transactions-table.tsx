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
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    ChevronDown,
    ChevronUp,
    Search,
    Filter,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    X,
    CalendarIcon,
    MoreHorizontal,
} from "lucide-react"
import { format } from "date-fns"
import { type Transaction } from "../types"
import { type Account } from "../../accounts/types"
import { type Category } from "../../categories/types"
import { cn } from "@/lib/utils"

// Add category colors mapping
const categoryColors: Record<string, { bg: string; text: string }> = {
    Food: { bg: "bg-blue-100", text: "text-blue-800" },
    Entertainment: { bg: "bg-yellow-100", text: "text-yellow-800" },
    Salary: { bg: "bg-green-100", text: "text-green-800" },
    // Add more categories as needed
}

interface TransactionsTableProps {
    data: Transaction[]
    accounts: Account[]
    categories: Category[]
    onEdit: (transaction: Transaction) => void
    onDelete: (transaction: Transaction) => void
}

export function TransactionsTable({
    data,
    accounts,
    categories,
    onEdit,
    onDelete,
}: TransactionsTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState("")
    const [filters, setFilters] = useState({
        dateRange: { from: null, to: null },
        accountId: "",
        categoryId: "",
        type: "",
    })
    const [sortConfig, setSortConfig] = useState({
        key: "date",
        direction: "desc",
    })

    const [dateRange, setDateRange] = useState<{
        from: Date | null
        to: Date | null
    }>({
        from: null,
        to: null,
    })

    // Enhanced filtering logic
    const filteredData = data.filter(transaction => {
        const matchesSearch = searchTerm === "" ||
            transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            categories.find(c => c.id === transaction.categoryId)?.name.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesAccount = filters.accountId === "" || transaction.accountId === filters.accountId
        const matchesCategory = filters.categoryId === "" || transaction.categoryId === filters.categoryId
        const matchesType = filters.type === "" || transaction.type === filters.type

        const transactionDate = new Date(transaction.date)
        const matchesDateRange = (!dateRange.from || transactionDate >= dateRange.from) &&
            (!dateRange.to || transactionDate <= dateRange.to)

        return matchesSearch && matchesAccount && matchesCategory && matchesType && matchesDateRange
    })

    // Sorting logic
    const sortedData = [...filteredData].sort((a, b) => {
        if (sortConfig.key === "date") {
            return sortConfig.direction === "asc"
                ? new Date(a.date).getTime() - new Date(b.date).getTime()
                : new Date(b.date).getTime() - new Date(a.date).getTime()
        }
        if (sortConfig.key === "amount") {
            return sortConfig.direction === "asc"
                ? a.amount - b.amount
                : b.amount - a.amount
        }
        return 0
    })

    // Pagination logic
    const totalPages = Math.ceil(sortedData.length / rowsPerPage)
    const paginatedData = sortedData.slice(
        (page - 1) * rowsPerPage,
        page * rowsPerPage
    )

    const toggleRowExpansion = (id: string) => {
        const newExpandedRows = new Set(expandedRows)
        if (expandedRows.has(id)) {
            newExpandedRows.delete(id)
        } else {
            newExpandedRows.add(id)
        }
        setExpandedRows(newExpandedRows)
    }

    // Reset all filters
    const clearFilters = () => {
        setSearchTerm("")
        setFilters({
            dateRange: { from: null, to: null },
            accountId: "",
            categoryId: "",
            type: "",
        })
        setDateRange({ from: null, to: null })
    }

    // Get category color
    const getCategoryColor = (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId)
        return categoryColors[category?.name || ""] || { bg: "bg-gray-100", text: "text-gray-800" }
    }

    return (
        <div className="space-y-4">
            {/* Enhanced Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <Input
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[300px]">
                            <div className="p-2 space-y-4">
                                {/* Date Range Filter */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date Range</label>
                                    <div className="flex gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dateRange.from ? (
                                                        format(dateRange.from, "PPP")
                                                    ) : (
                                                        "Start date"
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateRange.from || undefined}
                                                    onSelect={(date) =>
                                                        setDateRange((prev) => ({ ...prev, from: date }))
                                                    }
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dateRange.to ? (
                                                        format(dateRange.to, "PPP")
                                                    ) : (
                                                        "End date"
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateRange.to || undefined}
                                                    onSelect={(date) =>
                                                        setDateRange((prev) => ({ ...prev, to: date }))
                                                    }
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <DropdownMenuSeparator />

                                {/* Account Filter */}
                                <Select
                                    value={filters.accountId}
                                    onValueChange={(value) =>
                                        setFilters({ ...filters, accountId: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Accounts</SelectItem>
                                        {accounts.map((account) => (
                                            <SelectItem key={account.id} value={account.id}>
                                                {account.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <DropdownMenuSeparator />

                                {/* Type Filter */}
                                <Select
                                    value={filters.type}
                                    onValueChange={(value) =>
                                        setFilters({ ...filters, type: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All Types</SelectItem>
                                        <SelectItem value="Income">Income</SelectItem>
                                        <SelectItem value="Expense">Expense</SelectItem>
                                        <SelectItem value="Transfer">Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <DropdownMenuSeparator />

                            <div className="p-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={clearFilters}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Clear Filters
                                </Button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Enhanced Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[30px]"></TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        setSortConfig({
                                            key: "date",
                                            direction:
                                                sortConfig.key === "date" && sortConfig.direction === "asc"
                                                    ? "desc"
                                                    : "asc",
                                        })
                                    }
                                >
                                    Date
                                    {sortConfig.key === "date" && (
                                        <ChevronsUpDown className="ml-2 h-4 w-4" />
                                    )}
                                </Button>
                            </TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>
                                <Button
                                    variant="ghost"
                                    onClick={() =>
                                        setSortConfig({
                                            key: "amount",
                                            direction:
                                                sortConfig.key === "amount" && sortConfig.direction === "asc"
                                                    ? "desc"
                                                    : "asc",
                                        })
                                    }
                                >
                                    Amount
                                    {sortConfig.key === "amount" && (
                                        <ChevronsUpDown className="ml-2 h-4 w-4" />
                                    )}
                                </Button>
                            </TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.map((transaction) => (
                            <>
                                <TableRow key={transaction.id}>
                                    <TableCell>
                                        {transaction.subItems?.length ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleRowExpansion(transaction.id)}
                                            >
                                                {expandedRows.has(transaction.id) ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        ) : null}
                                    </TableCell>
                                    <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>
                                    <TableCell>
                                        {accounts.find((a) => a.id === transaction.accountId)?.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(getCategoryColor(transaction.categoryId).bg, getCategoryColor(transaction.categoryId).text)}>
                                            {categories.find(c => c.id === transaction.categoryId)?.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell>
                                        <span className={`font-medium ${transaction.type === "Income" ? "text-primary-dark" : "text-red-600"}`}>
                                            ${transaction.amount.toFixed(2)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onEdit(transaction)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(transaction)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>

                                {/* Enhanced Breakdown View */}
                                {expandedRows.has(transaction.id) && transaction.subItems && (
                                    <TableRow className="bg-muted/50">
                                        <TableCell colSpan={7}>
                                            <div className="pl-8 py-2">
                                                <div className="text-sm font-medium mb-2">Breakdown</div>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Item Name</TableHead>
                                                            <TableHead>Amount</TableHead>
                                                            <TableHead>Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {transaction.subItems.map((item) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell>{item.name}</TableCell>
                                                                <TableCell>
                                                                    <span className={item.status === "Paid" ? "text-green-600" : "text-red-600"}>
                                                                        ${item.amount.toFixed(2)}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant={item.status === "Paid" ? "success" : "error"}>
                                                                        {item.status}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Select
                        value={rowsPerPage.toString()}
                        onValueChange={(value) => {
                            setRowsPerPage(parseInt(value))
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10 rows</SelectItem>
                            <SelectItem value="20">20 rows</SelectItem>
                            <SelectItem value="50">50 rows</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
} 