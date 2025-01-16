'use client'

import { ReactNode } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface PageLayoutProps {
    title: string
    subtitle: string
    isLoading?: boolean
    isEmpty?: boolean
    emptyState?: {
        title: string
        description: string
        actionLabel: string
        onAction: () => void
    }
    headerAction?: {
        label: string
        onClick: () => void
        icon?: ReactNode
    }
    dialog?: {
        isOpen: boolean
        onOpenChange: (open: boolean) => void
        title: string
        content: ReactNode
    }
    children?: ReactNode
}

export function PageLayout({
    title,
    subtitle,
    isLoading,
    isEmpty,
    emptyState,
    headerAction,
    dialog,
    children
}: PageLayoutProps) {
    return (
        <div className="space-y-6">
            <PageHeader
                title={title}
                subtitle={subtitle}
            >
                {headerAction && (
                    <Button onClick={headerAction.onClick}>
                        {headerAction.icon}
                        {headerAction.label}
                    </Button>
                )}
            </PageHeader>

            {isLoading ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center">
                    <div className="loader" />
                    <p>Loading...</p>
                </div>
            ) : isEmpty && emptyState ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
                    <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                        <h3 className="mt-4 text-lg font-semibold">{emptyState.title}</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground">
                            {emptyState.description}
                        </p>
                        <Button onClick={emptyState.onAction}>
                            <Plus className="mr-2 h-4 w-4" />
                            {emptyState.actionLabel}
                        </Button>
                    </div>
                </div>
            ) : (
                children
            )}

            {dialog && (
                <Dialog open={dialog.isOpen} onOpenChange={dialog.onOpenChange}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{dialog.title}</DialogTitle>
                        </DialogHeader>
                        {dialog.content}
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
} 