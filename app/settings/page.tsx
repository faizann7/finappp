'use client'

import { useState } from "react"
import { Settings, User, Lock } from "lucide-react"
import { PageLayout } from "@/components/page-layout"

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)

    return (
        <PageLayout
            title="Settings"
            subtitle="Manage your preferences"
            isLoading={loading}
        >
            {/* Settings content */}
        </PageLayout>
    )
} 