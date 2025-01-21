'use client'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ReactNode } from "react"
import { useState } from "react"
import { useReactTable, getCoreRowModel } from "@tanstack/react-table"
import { ColumnDef } from "@tanstack/react-table"

interface Column {
    accessor: string
    header: string
    Cell?: (props: { row: { original: any } }) => ReactNode
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onRowSelectionChange?: (selection: Set<string>) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = useState({})

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onRowSelectionChange: (updatedSelection) => {
            setRowSelection(updatedSelection)
            onRowSelectionChange?.(new Set(
                Object.keys(updatedSelection).map(index => data[parseInt(index)].id)
            ))
        },
        state: {
            rowSelection,
        },
    })

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead key={column.accessor}>{column.header}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {columns.map((column) => (
                                <TableCell key={`${rowIndex}-${column.accessor}`}>
                                    {column.Cell ? (
                                        <column.Cell row={{ original: row }} />
                                    ) : (
                                        row[column.accessor]
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}