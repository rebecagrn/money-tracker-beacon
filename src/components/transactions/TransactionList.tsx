import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowUp, ArrowDown, Calendar, Search, Filter, Edit2, Trash2 } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { defaultCategories } from '@/data/defaultCategories';
import { formatCurrency } from '@/utils/financeCalculations';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction?: (id: string) => void;
  onEditTransaction?: (transaction: Transaction) => void;
}

export const TransactionList = ({ transactions, onDeleteTransaction, onEditTransaction }: TransactionListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'week' | 'month' | 'year'>('all');

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
      const matchesType = filterType === 'all' || transaction.type === filterType;
      
      // Period filter
      const transactionDate = new Date(transaction.date);
      const now = new Date();
      let matchesPeriod = true;
      
      if (filterPeriod === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        matchesPeriod = transactionDate >= weekAgo;
      } else if (filterPeriod === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        matchesPeriod = transactionDate >= monthAgo;
      } else if (filterPeriod === 'year') {
        const yearAgo = new Date(now.getFullYear(), 0, 1);
        matchesPeriod = transactionDate >= yearAgo;
      }
      
      return matchesSearch && matchesCategory && matchesType && matchesPeriod;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return b.amount - a.amount;
      }
    });

  const getCategoryInfo = (categoryId: string) => {
    return defaultCategories.find(cat => cat.id === categoryId) || {
      name: categoryId,
      color: '#666666'
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="finance-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Recent Transactions</h3>
        <Badge variant="secondary">
          {filteredTransactions.length} transactions
        </Badge>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'income' | 'expense')}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expenses</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {defaultCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPeriod} onValueChange={(value) => setFilterPeriod(value as 'all' | 'week' | 'month' | 'year')}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'amount')}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Sort by Date</SelectItem>
            <SelectItem value="amount">Sort by Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transactions found matching your criteria</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => {
            const categoryInfo = getCategoryInfo(transaction.category);
            const isIncome = transaction.type === 'income';
            
            return (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isIncome ? 'success-gradient' : 'bg-warning'
                  }`}>
                    {isIncome ? (
                      <ArrowUp className="w-5 h-5 text-white" />
                    ) : (
                      <ArrowDown className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium">{transaction.description}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: categoryInfo.color }}
                      />
                  <span className="text-sm text-muted-foreground">
                    {categoryInfo.name}
                  </span>
                  {transaction.originalCurrency && transaction.originalCurrency !== 'BRL' && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {transaction.originalAmount.toFixed(2)} {transaction.originalCurrency}
                      </span>
                    </>
                  )}
                  {transaction.wallet && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {transaction.wallet}
                      </span>
                    </>
                  )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-semibold ${
                    isIncome ? 'text-success' : 'text-warning'
                  }`}>
                    {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, 'BRL')}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {formatDate(transaction.date)}
                    </span>
                    {transaction.isRecurring && (
                      <Badge variant="secondary" className="text-xs">
                        {transaction.recurringFrequency}
                      </Badge>
                    )}
                    {transaction.isFixed && (
                      <Badge variant="outline" className="text-xs">
                        Fixed
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {onEditTransaction && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditTransaction(transaction)}
                      className="text-primary hover:text-primary"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                  {onDeleteTransaction && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteTransaction(transaction.id)}
                      className="text-danger hover:text-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};