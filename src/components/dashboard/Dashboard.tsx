import { useState, useEffect } from 'react';
import { FinancialOverview } from './FinancialOverview';
import { TransactionForm } from '../transactions/TransactionForm';
import { TransactionList } from '../transactions/TransactionList';
import { SpendingChart } from '../charts/SpendingChart';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PieChart, BarChart, Calculator, Download, Settings } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { getFinancialSummary, calculateNetIncome, formatCurrency } from '@/utils/financeCalculations';
import { defaultCategories } from '@/data/defaultCategories';
import { useToast } from '@/hooks/use-toast';

export const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [grossIncome, setGrossIncome] = useState('');
  const [taxRate, setTaxRate] = useState(6);
  const { toast } = useToast();

  // Load transactions from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('finance-transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('finance-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [transaction, ...prev]);
    setShowForm(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({
      title: 'Transaction Deleted',
      description: 'The transaction has been removed from your records.',
    });
  };

  const summary = getFinancialSummary(transactions, 'monthly');
  
  // Prepare chart data
  const chartData = summary.topCategories.map((cat, index) => {
    const categoryInfo = defaultCategories.find(c => c.id === cat.category);
    return {
      name: categoryInfo?.name || cat.category,
      value: cat.amount,
      color: categoryInfo?.color || '#666666',
      percentage: cat.percentage
    };
  });

  // Calculate net income
  const netIncomeCalc = grossIncome ? calculateNetIncome(parseFloat(grossIncome), taxRate) : null;

  const exportToCsv = () => {
    const csvContent = transactions.map(t => 
      `${t.date},${t.type},${t.amount},${t.category},${t.description},${t.currency}`
    ).join('\n');
    
    const csvHeader = 'Date,Type,Amount,Category,Description,Currency\n';
    const fullCsv = csvHeader + csvContent;
    
    const blob = new Blob([fullCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: 'Data Exported',
      description: 'Your financial data has been exported to CSV.',
    });
  };

  return (
    <div className="min-h-screen dashboard-bg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Financial Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your income, expenses, and financial goals
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={exportToCsv}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="finance-gradient gap-2"
            >
              {showForm ? 'Close Form' : 'Add Transaction'}
            </Button>
          </div>
        </div>

        {/* Financial Overview */}
        <FinancialOverview data={summary} />

        {/* Net Income Calculator */}
        <Card className="finance-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 finance-gradient rounded-xl flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Net Income Calculator</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Gross Income</label>
              <Input
                type="number"
                placeholder="Enter gross income"
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tax Rate (%)</label>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0"
                max="100"
              />
            </div>
            <div className="flex flex-col justify-end">
              {netIncomeCalc && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Tax: {formatCurrency(netIncomeCalc.tax)}
                  </p>
                  <p className="text-lg font-semibold text-success">
                    Net: {formatCurrency(netIncomeCalc.net)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transaction Form */}
          {showForm && (
            <div className="animate-fade-in">
              <TransactionForm onAddTransaction={addTransaction} />
            </div>
          )}

          {/* Spending Chart */}
          <div className={showForm ? '' : 'lg:col-span-2'}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Spending Analysis</h3>
              <div className="flex gap-2">
                <Button
                  variant={chartType === 'pie' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('pie')}
                  className="gap-2"
                >
                  <PieChart className="w-4 h-4" />
                  Pie
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                  className="gap-2"
                >
                  <BarChart className="w-4 h-4" />
                  Bar
                </Button>
              </div>
            </div>
            
            <SpendingChart
              data={chartData}
              title="Spending by Category"
              type={chartType}
              currency={summary.currency}
            />
          </div>
        </div>

        {/* Transaction List */}
        <TransactionList 
          transactions={transactions} 
          onDeleteTransaction={deleteTransaction}
        />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="finance-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{transactions.length}</p>
            <p className="text-sm text-muted-foreground">Total Transactions</p>
          </Card>
          <Card className="finance-card p-4 text-center">
            <p className="text-2xl font-bold text-success">
              {transactions.filter(t => t.type === 'income').length}
            </p>
            <p className="text-sm text-muted-foreground">Income Entries</p>
          </Card>
          <Card className="finance-card p-4 text-center">
            <p className="text-2xl font-bold text-warning">
              {transactions.filter(t => t.type === 'expense').length}
            </p>
            <p className="text-sm text-muted-foreground">Expense Entries</p>
          </Card>
          <Card className="finance-card p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {summary.savingsRate.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Savings Rate</p>
          </Card>
        </div>
      </div>
    </div>
  );
};