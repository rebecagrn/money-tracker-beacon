import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FinancialGoal } from '@/types/finance';
import { formatCurrency } from '@/utils/financeCalculations';
import { Target, Calendar, TrendingUp } from 'lucide-react';

interface GoalsOverviewProps {
  goals: FinancialGoal[];
}

export const GoalsOverview = ({ goals }: GoalsOverviewProps) => {
  const activeGoals = goals.filter(goal => goal.currentAmount < goal.targetAmount);
  const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="finance-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 finance-gradient rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Active Goals</h3>
            <p className="text-2xl font-bold text-primary">{activeGoals.length}</p>
          </div>
        </div>
      </Card>

      <Card className="finance-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div>
            <h3 className="font-semibold">Completed</h3>
            <p className="text-2xl font-bold text-success">{completedGoals.length}</p>
          </div>
        </div>
      </Card>

      <Card className="finance-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-warning/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold">Total Goals</h3>
            <p className="text-2xl font-bold text-foreground">{goals.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};