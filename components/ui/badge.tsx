'use client'

import { ReactNode } from "react"

interface BadgeProps {
    children: ReactNode
    variant?: "default" | "success" | "error" | "warning" | "outline"
}

const badgeStyles = {
    default: "bg-gray-200 text-gray-800",
    success: "bg-green-200 text-green-800",
    error: "bg-red-200 text-red-800",
    warning: "bg-yellow-200 text-yellow-800",
    outline: "border border-gray-300 text-gray-800 bg-transparent"
}

export function Badge({ children, variant = "default" }: BadgeProps) {
    return (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${badgeStyles[variant]}`}>
            {children}
        </span>
    )
} 