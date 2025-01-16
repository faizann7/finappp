'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

export function Breadcrumbs() {
    const pathname = usePathname()
    const paths = pathname.split('/').filter(path => path)

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                {paths.map((path, index) => {
                    const href = `/${paths.slice(0, index + 1).join('/')}`
                    const isLast = index === paths.length - 1

                    return (
                        <BreadcrumbItem key={path}>
                            <BreadcrumbSeparator />
                            {isLast ? (
                                <BreadcrumbPage>{capitalizeFirstLetter(path)}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink href={href}>
                                    {capitalizeFirstLetter(path)}
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
} 