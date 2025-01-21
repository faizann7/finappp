'use client'

import { useState, useEffect } from "react"
import { LineChart, PieChart, BarChart3, Target } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { SpendingTrends } from "../analytics/components/spending-trends"
import { TransactionsTable } from "../transactions/components/transactions-table"
import { type Transaction } from "../transactions/types"
import { type Account } from "../accounts/types"
import { type Category } from "../categories/types"
import { type Budget } from "../budgets/types"
import Insights from "../analytics/components/Insights"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = () => {
      const storedTransactions = localStorage.getItem('finance-tracker-transactions')
      const storedAccounts = localStorage.getItem('finance-tracker-accounts')
      const storedCategories = localStorage.getItem('finance-tracker-categories')
      const storedBudgets = localStorage.getItem('finance-tracker-budgets')

      if (storedTransactions) setTransactions(JSON.parse(storedTransactions))
      if (storedAccounts) setAccounts(JSON.parse(storedAccounts))
      if (storedCategories) setCategories(JSON.parse(storedCategories))
      if (storedBudgets) setBudgets(JSON.parse(storedBudgets))

      setLoading(false)
    }

    loadData()
  }, [])

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Get an overview of your financial health"
      isLoading={loading}
      isEmpty={transactions.length === 0}
      emptyState={{
        title: "No data to analyze",
        description: "Add some transactions to see detailed analytics of your spending patterns.",
        actionLabel: "Add Transaction",
        onAction: () => {/* Navigate to transactions */ },
        icons: [LineChart, PieChart, BarChart3]
      }}
    >
      <div className="grid gap-4">
        {/* Top Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Insights />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols gap-4">
          <SpendingTrends transactions={transactions} />
        </div>

        {/* Transactions and Goal Row */}
        <div className="grid grid-cols-[2fr,1fr] gap-4">
          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionsTable
                data={transactions.slice(0, 5)}
                accounts={accounts}
                categories={categories}
                onEdit={() => { }}
                onDelete={() => { }}
              />
            </CardContent>
          </Card>

          {/* Savings Goal Card */}
          <Card>
            <CardHeader>
              <CardTitle>Savings Goal</CardTitle>
              <CardDescription>Track your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">New Car</p>
                    <p className="text-2xl font-bold">$10,000</p>
                  </div>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
                <Progress value={65} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>$6,500 saved</span>
                  <span>65% completed</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You're on track to reach your goal by September 2024
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
} 