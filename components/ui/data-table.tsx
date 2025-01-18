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

interface Column {
    accessor: string
    header: string
    Cell?: (props: { row: { original: any } }) => ReactNode
}

interface DataTableProps {
    data: any[]
    columns: Column[]
}

export function DataTable({ data, columns }: DataTableProps) {
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