export type Account = {
    id: string
    name: string
    type: 'Bank' | 'Cash' | 'Credit Card' | 'Investment' | 'Other'
    balance: number
    currency: string
}

export const ACCOUNT_TYPES = [
    { label: 'Bank Account', value: 'Bank' },
    { label: 'Cash', value: 'Cash' },
    { label: 'Credit Card', value: 'Credit Card' },
    { label: 'Investment', value: 'Investment' },
    { label: 'Other', value: 'Other' },
]

export const CURRENCIES = [
    { label: 'USD - US Dollar', value: 'USD' },
    { label: 'EUR - Euro', value: 'EUR' },
    { label: 'GBP - British Pound', value: 'GBP' },
    { label: 'INR - Indian Rupee', value: 'INR' },
    { label: 'JPY - Japanese Yen', value: 'JPY' },
] 