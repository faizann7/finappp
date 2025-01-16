'use client'

import { ReactNode } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Files, FileText, Link, Plus } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/ui/empty-state"

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
        icons?: React.ReactNode[]
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
                <div className="w-full flex justify-center">
                    <EmptyState
                        title={emptyState.title}
                        description={emptyState.description}
                        icons={emptyState.icons || []}
                        action={{
                            label: emptyState.actionLabel,
                            onClick: emptyState.onAction,
                        }}
                        className="w-full"
                    />
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