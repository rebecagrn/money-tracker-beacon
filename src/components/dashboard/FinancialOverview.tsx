import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Circle } from 'lucide-react';

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  currency: string;
}

interface FinancialOverviewProps {
  data: FinancialData;
}

export const FinancialOverview = ({ data }: FinancialOverviewProps) => {
  const { totalIncome, totalExpenses, balance, currency } = data;
  const balanceColor = balance >= 0 ? 'text-success' : 'text-danger';
  const balanceIcon = balance >= 0 ? ArrowUp : ArrowDown;
  const BalanceIcon = balanceIcon;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Income */}
      <Card className="finance-card p-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Total Income
            </p>
            <p className="text-2xl font-bold text-success">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div className="w-12 h-12 success-gradient rounded-xl flex items-center justify-center">
            <ArrowUp className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="mt-4">
          <Badge variant="secondary" className="bg-success-light text-success">
            +{((totalIncome / (totalIncome + totalExpenses)) * 100).toFixed(1)}%
          </Badge>
        </div>
      </Card>

      {/* Total Expenses */}
      <Card className="finance-card p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Total Expenses
            </p>
            <p className="text-2xl font-bold text-warning">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center">
            <ArrowDown className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="mt-4">
          <Badge variant="secondary" className="bg-warning-light text-warning">
            -{((totalExpenses / (totalIncome + totalExpenses)) * 100).toFixed(1)}%
          </Badge>
        </div>
      </Card>

      {/* Balance */}
      <Card className="finance-card p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Current Balance
            </p>
            <p className={`text-2xl font-bold ${balanceColor}`}>
              {formatCurrency(balance)}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            balance >= 0 ? 'success-gradient' : 'bg-danger'
          }`}>
            <BalanceIcon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="mt-4">
          <Badge variant="secondary" className={
            balance >= 0 
              ? 'bg-success-light text-success' 
              : 'bg-danger-light text-danger'
          }>
            {balance >= 0 ? 'Positive' : 'Negative'}
          </Badge>
        </div>
      </Card>
    </div>
  );
};