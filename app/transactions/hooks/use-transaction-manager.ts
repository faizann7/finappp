import { useState, useEffect } from 'react';
import { type Transaction } from '../types';
import { type Account } from '../../accounts/types';
import { type Budget } from '../../budgets/types';

export function useTransactionManager() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);

    // Handle transaction creation/update
    const handleTransaction = (transaction: Transaction, isNew: boolean) => {
        // 1. Update account balances
        updateAccountBalance(transaction, isNew);

        // 2. Update budget spent amounts
        if (transaction.type === 'Expense') {
            updateBudgetSpent(transaction, isNew);
        }

        // 3. Save transaction
        saveTransaction(transaction, isNew);
    };

    // Update account balance
    const updateAccountBalance = (transaction: Transaction, isNew: boolean) => {
        setAccounts(currentAccounts => {
            return currentAccounts.map(account => {
                if (account.id === transaction.accountId) {
                    const balanceChange = isNew ?
                        (transaction.type === 'Expense' ? -transaction.amount : transaction.amount) :
                        0; // Handle edit case differently

                    return {
                        ...account,
                        balance: account.balance + balanceChange
                    };
                }
                return account;
            });
        });
    };

    // Update budget spent amount
    const updateBudgetSpent = (transaction: Transaction, isNew: boolean) => {
        if (!transaction.budgetId) return;

        setBudgets(currentBudgets => {
            return currentBudgets.map(budget => {
                if (budget.id === transaction.budgetId) {
                    const spentChange = isNew ? transaction.amount : 0; // Handle edit case differently

                    return {
                        ...budget,
                        spent: budget.spent + spentChange
                    };
                }
                return budget;
            });
        });
    };

    // Save changes to localStorage
    useEffect(() => {
        localStorage.setItem('finance-tracker-accounts', JSON.stringify(accounts));
        localStorage.setItem('finance-tracker-budgets', JSON.stringify(budgets));
        localStorage.setItem('finance-tracker-transactions', JSON.stringify(transactions));
    }, [accounts, budgets, transactions]);

    return {
        transactions,
        accounts,
        budgets,
        handleTransaction
    };
} 