import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface InsightCardProps {
    title: string;
    value: string;
    badgeValue: string;
    description: string;
    data: { date: string; value: number }[];
    color: string;
}

const InsightCard = ({ title, value, badgeValue, description, data, color }: InsightCardProps) => {
    return (
        <Card>
            <CardContent className="flex flex-col p-6">
                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-center">
                            <div className="text-2xl font-bold">{value}</div>
                            <span className="bg-green-200 text-green-800 text-xs font-medium px-2 py-1 rounded ml-2">
                                {badgeValue}
                            </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{description}</span>
                    </div>
                    <div className="w-[90px]"> {/* Fixed width for the chart */}
                        <ResponsiveContainer width="100%" height={40}>
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" hide />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke={color}
                                    fill={`url(#gradient-${color})`}
                                    fillOpacity={0.2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const Insights = () => {
    const transactions = JSON.parse(localStorage.getItem('finance-tracker-transactions') || '[]');

    const getMonthData = (monthOffset: number) => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 0);

        return transactions.filter((t: any) => {
            const date = new Date(t.date);
            return date >= startDate && date <= endDate;
        });
    };

    const currentMonthTransactions = getMonthData(0);
    const previousMonthTransactions = getMonthData(1);

    const totalExpenses = (transactions: any[]) =>
        transactions.filter((t: any) => t.type === "Expense").reduce((acc: number, t: any) => acc + t.amount, 0);

    const totalIncome = (transactions: any[]) =>
        transactions.filter((t: any) => t.type === "Income").reduce((acc: number, t: any) => acc + t.amount, 0);

    const totalSavings = (transactions: any[]) =>
        transactions.filter((t: any) => t.category === "Savings").reduce((acc: number, t: any) => acc + t.amount, 0);

    const totalExpensesCurrent = totalExpenses(currentMonthTransactions);
    const totalExpensesPrevious = totalExpenses(previousMonthTransactions);
    const totalIncomeCurrent = totalIncome(currentMonthTransactions);
    const totalIncomePrevious = totalIncome(previousMonthTransactions);
    const totalSavingsCurrent = totalSavings(currentMonthTransactions);
    const totalSavingsPrevious = totalSavings(previousMonthTransactions);

    const balance = totalIncomeCurrent - totalExpensesCurrent;

    const expensesData = currentMonthTransactions.map((t: any) => ({
        date: t.date,
        value: t.type === "Expense" ? t.amount : 0,
    }));

    const incomeData = currentMonthTransactions.map((t: any) => ({
        date: t.date,
        value: t.type === "Income" ? t.amount : 0,
    }));

    const expensesChange = totalExpensesPrevious ? ((totalExpensesCurrent - totalExpensesPrevious) / totalExpensesPrevious * 100).toFixed(1) : 0;
    const incomeChange = totalIncomePrevious ? ((totalIncomeCurrent - totalIncomePrevious) / totalIncomePrevious * 100).toFixed(1) : 0;
    const savingsChange = totalSavingsPrevious ? ((totalSavingsCurrent - totalSavingsPrevious) / totalSavingsPrevious * 100).toFixed(1) : 0;

    const savingsBadgeValue = totalSavingsCurrent === 0 && totalSavingsPrevious > 0 ? "-100%" : savingsChange;
    const balanceBadgeValue = totalIncomePrevious ? ((balance / totalIncomePrevious) * 100).toFixed(1) : 0;

    return (
        <>
            <InsightCard
                title="Total Expenses"
                value={`$${totalExpensesCurrent.toLocaleString()}`}
                badgeValue={`${expensesChange}%`}
                description="Compared to last month"
                data={expensesData}
                color="#FF5733"
            />
            <InsightCard
                title="Total Income"
                value={`$${totalIncomeCurrent.toLocaleString()}`}
                badgeValue={`${incomeChange}%`}
                description="Compared to last month"
                data={incomeData}
                color="#33FF57"
            />
            <InsightCard
                title="Total Savings"
                value={`$${totalSavingsCurrent.toLocaleString()}`}
                badgeValue={savingsBadgeValue}
                description="Compared to last month"
                data={incomeData}
                color="#FFC300"
            />
            <InsightCard
                title="Balance"
                value={`$${balance.toLocaleString()}`}
                badgeValue={`${balanceBadgeValue}%`}
                description="Compared to last month"
                data={incomeData}
                color="#1751D0"
            />
        </>
    );
};

export default Insights; 