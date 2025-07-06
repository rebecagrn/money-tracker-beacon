import { Transaction, FinancialSummary } from '@/types/finance';

export const calculateNetIncome = (grossIncome: number, taxRate: number = 0.06): {
  gross: number;
  tax: number;
  net: number;
} => {
  const tax = grossIncome * (taxRate / 100);
  const net = grossIncome - tax;
  
  return {
    gross: grossIncome,
    tax,
    net
  };
};

export const getFinancialSummary = (
  transactions: Transaction[], 
  period: 'monthly' | 'yearly' | 'custom' = 'monthly'
): FinancialSummary => {
  const now = new Date();
  let startDate: Date;
  
  switch (period) {
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'yearly':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(0);
  }
  
  const filteredTransactions = transactions.filter(t => new Date(t.date) >= startDate);
  
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
  
  // Calculate top spending categories
  const categorySpending = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
    
  const topCategories = Object.entries(categorySpending)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  return {
    totalIncome,
    totalExpenses,
    balance,
    currency: 'BRL', // Always BRL since we convert everything
    period: period === 'monthly' ? 'This Month' : 'This Year',
    savingsRate,
    topCategories
  };
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const getCategoryBudgetStatus = (
  transactions: Transaction[],
  categoryId: string,
  budgetLimit: number,
  period: 'monthly' | 'weekly' = 'monthly'
): {
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'over';
} => {
  const now = new Date();
  let startDate: Date;
  
  if (period === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    const dayOfWeek = now.getDay();
    startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
  }
  
  const spent = transactions
    .filter(t => 
      t.type === 'expense' && 
      t.category === categoryId && 
      new Date(t.date) >= startDate
    )
    .reduce((sum, t) => sum + t.amount, 0);
  
  const remaining = budgetLimit - spent;
  const percentage = budgetLimit > 0 ? (spent / budgetLimit) * 100 : 0;
  
  let status: 'safe' | 'warning' | 'over' = 'safe';
  if (percentage >= 100) status = 'over';
  else if (percentage >= 80) status = 'warning';
  
  return {
    spent,
    remaining,
    percentage,
    status
  };
};