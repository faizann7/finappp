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
    Edit2,
} from "lucide-react"
import { format } from "date-fns"
import { type Transaction } from "../types"
import { type Account } from "../../accounts/types"
import { type Category } from "../../categories/types"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"

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
    onBulkDelete?: (transactionIds: string[]) => void
}

export function TransactionsTable({
    data,
    accounts,
    categories,
    onEdit,
    onDelete,
    onBulkDelete,
}: TransactionsTableProps) {
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
    const [page, setPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState("")
    const [filters, setFilters] = useState({
        dateRange: { from: null, to: null },
        accountId: "",
        categoryIds: [] as string[],
        type: "",
    })
    const [sortConfig, setSortConfig] = useState({
        key: "date",
        direction: "desc",
    })
    const [selectedRows, setSelectedRows] = useState<string[]>([])

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
        const matchesCategory = filters.categoryIds.length === 0 || filters.categoryIds.includes(transaction.categoryId)
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
            categoryIds: [],
            type: "",
        })
        setDateRange({ from: null, to: null })
    }

    // Get category color
    const getCategoryColor = (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId)
        return categoryColors[category?.name || ""] || { bg: "bg-gray-100", text: "text-gray-800" }
    }

    // Check if any filters are active
    const isFilterActive = () => {
        return (
            searchTerm !== "" ||
            filters.accountId !== "" ||
            filters.categoryIds.length > 0 ||
            filters.type !== "" ||
            (dateRange.from !== null || dateRange.to !== null)
        );
    };

    const handleRowSelect = (transactionId: string) => {
        setSelectedRows((prev) => {
            if (prev.includes(transactionId)) {
                return prev.filter(id => id !== transactionId)
            } else {
                return [...prev, transactionId]
            }
        })
    }

    return (
        <div className="space-y-4">
            {/* Filters Row */}
            <div className="flex items-center justify-between">
                <div className="flex flex-1 items-center space-x-2">
                    <Input
                        placeholder="Filter transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                    {/* Date Range Filter */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 border-dashed">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from ? (
                                    dateRange.to ? (
                                        <>
                                            {format(dateRange.from, "LLL dd, y")} -{" "}
                                            {format(dateRange.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                selected={{
                                    from: dateRange.from,
                                    to: dateRange.to,
                                }}
                                onSelect={(range) => {
                                    setDateRange(range)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                    {/* Account Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 border-dashed">
                                <span>Account</span>
                                {filters.accountId && (
                                    <>
                                        <Separator orientation="vertical" className="mx-2 h-4" />
                                        <Badge
                                            variant="secondary"
                                            className="rounded-sm px-1 font-normal"
                                        >
                                            {accounts.find(a => a.id === filters.accountId)?.name}
                                        </Badge>
                                    </>
                                )}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setFilters(f => ({ ...f, accountId: "" }))}>
                                All Accounts
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {accounts.map((account) => (
                                <DropdownMenuItem
                                    key={account.id}
                                    onClick={() => setFilters(f => ({ ...f, accountId: account.id }))}
                                >
                                    {account.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Category Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 border-dashed">
                                <span>Category</span>
                                {filters.categoryIds.length > 0 && (
                                    <>
                                        <Separator orientation="vertical" className="mx-2 h-4" />
                                        <div className="flex space-x-1">
                                            {filters.categoryIds.length > 2 ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="rounded-sm px-1 font-normal"
                                                >

                                                    {filters.categoryIds.length} selected
                                                </Badge>
                                            ) : (
                                                filters.categoryIds.map(id => {
                                                    const category = categories.find(c => c.id === id);
                                                    return category ? (
                                                        <Badge
                                                            key={id}
                                                            variant="secondary"
                                                            className="rounded-sm px-1 font-normal"
                                                        >
                                                            {category.name}
                                                        </Badge>
                                                    ) : null;
                                                })
                                            )}
                                        </div>
                                    </>
                                )}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {categories.map((category) => (
                                <DropdownMenuItem key={category.id}>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={filters.categoryIds.includes(category.id)}
                                            onChange={() => {
                                                setFilters((prev) => {
                                                    const newCategoryIds = prev.categoryIds.includes(category.id)
                                                        ? prev.categoryIds.filter(id => id !== category.id)
                                                        : [...prev.categoryIds, category.id];
                                                    return { ...prev, categoryIds: newCategoryIds };
                                                });
                                            }}
                                        />
                                        <span className="ml-2">{category.name}</span>
                                    </label>
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setFilters(f => ({ ...f, categoryIds: [] }))}>
                                Clear Selection
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Type Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 border-dashed">
                                <span>Type</span>
                                {filters.type && (
                                    <>
                                        <Separator orientation="vertical" className="mx-2 h-4" />
                                        <Badge
                                            variant="secondary"
                                            className="rounded-sm px-1 font-normal"
                                        >
                                            {filters.type}
                                        </Badge>
                                    </>
                                )}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setFilters(f => ({ ...f, type: "" }))}>
                                All Types
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {["Income", "Expense", "Transfer"].map((type) => (
                                <DropdownMenuItem
                                    key={type}
                                    onClick={() => setFilters(f => ({ ...f, type }))}
                                >
                                    {type}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Reset Filters */}
                    {isFilterActive() && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="h-8 px-2 lg:px-3"
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
                        onClick={() => onBulkDelete?.(selectedRows)}
                        className="gap-2 h-8"
                    >
                        <Trash2 className="h-4 w-4" />
                        Delete Selected ({selectedRows.length})
                    </Button>
                )}
            </div>

            {/* Enhanced Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                <Checkbox
                                    checked={selectedRows.length === data.length}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedRows(data.map(transaction => transaction.id))
                                        } else {
                                            setSelectedRows([])
                                        }
                                    }}
                                />
                            </TableHead>
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
                                    className="h-auto p-0 font-medium hover:bg-transparent"
                                >
                                    Date
                                    <ChevronsUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Account</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">
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
                                    className="h-auto p-0 font-medium hover:bg-transparent ml-auto"
                                >
                                    Amount
                                    <ChevronsUpDown className="ml-2 h-4 w-4" />
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
                                        <Checkbox
                                            checked={selectedRows.includes(transaction.id)}
                                            onCheckedChange={() => handleRowSelect(transaction.id)}
                                        />
                                    </TableCell>
                                    <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-foreground">
                                            {transaction.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {accounts.find((a) => a.id === transaction.accountId)?.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={cn(getCategoryColor(transaction.categoryId).bg, getCategoryColor(transaction.categoryId).text)}>
                                            {categories.find(c => c.id === transaction.categoryId)?.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{transaction.description}</TableCell>
                                    <TableCell className="text-right">
                                        <span className={`font-semibold ${transaction.type === "Income"
                                            ? "text-green-700"
                                            : "text-black"
                                            }`}>
                                            {transaction.type === "Income" ? "+" : ""}${transaction.amount.toFixed(2)}
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