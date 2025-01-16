interface PageHeaderProps {
    title: string
    subtitle?: string
    children?: React.ReactNode
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-muted-foreground">
                        {subtitle}
                    </p>
                )}
            </div>
            {children}
        </div>
    )
} 