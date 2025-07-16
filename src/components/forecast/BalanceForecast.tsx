import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { formatCurrency } from '@/utils/financeCalculations';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface BalanceForecastProps {
  transactions: Transaction[];
  currentBalance: number;
}

interface ForecastData {
  month: string;
  projectedBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  difference: number;
}

export const BalanceForecast = ({ transactions, currentBalance }: BalanceForecastProps) => {
  const { t } = useTranslation();
  const [forecastMonths, setForecastMonths] = useState('6');

  const calculateForecast = (): ForecastData[] => {
    const now = new Date();
    const months = parseInt(forecastMonths);
    const forecast: ForecastData[] = [];

    // Calculate average monthly income and expenses from recurring transactions
    const recurringIncome = transactions
      .filter(t => t.type === 'income' && t.isRecurring)
      .reduce((sum, t) => {
        const multiplier = t.recurringFrequency === 'monthly' ? 1 : 
                          t.recurringFrequency === 'weekly' ? 4.33 :
                          t.recurringFrequency === 'yearly' ? 1/12 : 1;
        return sum + (t.amount * multiplier);
      }, 0);

    const recurringExpenses = transactions
      .filter(t => t.type === 'expense' && (t.isRecurring || t.isFixed))
      .reduce((sum, t) => {
        const multiplier = t.recurringFrequency === 'monthly' ? 1 : 
                          t.recurringFrequency === 'weekly' ? 4.33 :
                          t.recurringFrequency === 'yearly' ? 1/12 : 1;
        return sum + (t.amount * multiplier);
      }, 0);

    // Calculate average variable expenses from last 3 months
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const variableExpenses = transactions
      .filter(t => 
        t.type === 'expense' && 
        !t.isRecurring && 
        !t.isFixed && 
        new Date(t.date) >= threeMonthsAgo
      )
      .reduce((sum, t) => sum + t.amount, 0) / 3;

    let runningBalance = currentBalance;

    for (let i = 0; i < months; i++) {
      const futureDate = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      const monthName = futureDate.toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: 'numeric' 
      });

      const monthlyIncome = recurringIncome;
      const monthlyExpenses = recurringExpenses + variableExpenses;
      const difference = monthlyIncome - monthlyExpenses;
      
      runningBalance += difference;

      forecast.push({
        month: monthName,
        projectedBalance: runningBalance,
        monthlyIncome,
        monthlyExpenses,
        difference
      });
    }

    return forecast;
  };

  const forecastData = calculateForecast();
  const worstMonth = forecastData.reduce((worst, current) => 
    current.projectedBalance < worst.projectedBalance ? current : worst
  );
  const bestMonth = forecastData.reduce((best, current) => 
    current.projectedBalance > best.projectedBalance ? current : best
  );

  return (
    <Card className="finance-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 finance-gradient rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold">{t("dashboard.forecast")}</h3>
        </div>
        
        <Select value={forecastMonths} onValueChange={setForecastMonths}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">{t("filters.3months")}</SelectItem>
            <SelectItem value="6">{t("filters.6months")}</SelectItem>
            <SelectItem value="12">{t("filters.12months")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-gradient-to-br from-success/10 to-success/5 border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">{t("dashboard.thisMonth")}</span>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(bestMonth.projectedBalance, 'BRL')}</p>
          <p className="text-xs text-muted-foreground">{bestMonth.month}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">{t("dashboard.thisMonth")}</span>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(worstMonth.projectedBalance, 'BRL')}</p>
          <p className="text-xs text-muted-foreground">{worstMonth.month}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t("dashboard.currentBalance")}</span>
          </div>
          <p className="text-lg font-semibold">{formatCurrency(currentBalance, 'BRL')}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </Card>
      </div>

      {/* Forecast Timeline */}
      <div className="space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {t("dashboard.forecast")}
        </h4>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {forecastData.map((data, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  data.projectedBalance > currentBalance ? 'bg-success' :
                  data.projectedBalance < 0 ? 'bg-destructive' : 'bg-warning'
                }`} />
                <div>
                  <p className="font-medium">{data.month}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("dashboard.income")}: {formatCurrency(data.monthlyIncome, 'BRL')} | 
                    {t("dashboard.expenses")}: {formatCurrency(data.monthlyExpenses, 'BRL')}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${
                  data.projectedBalance > currentBalance ? 'text-success' :
                  data.projectedBalance < 0 ? 'text-destructive' : 'text-warning'
                }`}>
                  {formatCurrency(data.projectedBalance, 'BRL')}
                </p>
                <div className="flex items-center gap-1">
                  {data.difference > 0 ? (
                    <TrendingUp className="w-3 h-3 text-success" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-destructive" />
                  )}
                  <span className={`text-xs ${
                    data.difference > 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {data.difference > 0 ? '+' : ''}{formatCurrency(data.difference, 'BRL')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};