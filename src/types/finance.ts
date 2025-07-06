export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  originalAmount: number;
  category: string;
  description: string;
  date: string;
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isFixed: boolean;
  currency: string;
  originalCurrency: string;
  exchangeRate?: number;
  wallet?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  budgetLimit?: number;
  icon: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  type: 'save' | 'spend_less' | 'earn_more';
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly';
  currency: string;
}

export interface Wallet {
  id: string;
  name: string;
  currency: string;
  balance: number;
  isDefault: boolean;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  currency: string;
  period: string;
  savingsRate: number;
  topCategories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
}