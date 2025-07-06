import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FinancialGoal } from '@/types/finance';
import { formatCurrency } from '@/utils/financeCalculations';
import { Target, Calendar, Trash2, TrendingUp } from 'lucide-react';

interface GoalsListProps {
  goals: FinancialGoal[];
  onDeleteGoal: (id: string) => void;
  onUpdateProgress: (id: string, amount: number) => void;
}

export const GoalsList = ({ goals, onDeleteGoal, onUpdateProgress }: GoalsListProps) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'save': return 'bg-primary text-primary-foreground';
      case 'spend_less': return 'bg-warning text-warning-foreground';
      case 'earn_more': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'save': return 'Save';
      case 'spend_less': return 'Spend Less';
      case 'earn_more': return 'Earn More';
      default: return type;
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const isCompleted = (current: number, target: number) => current >= target;

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (goals.length === 0) {
    return (
      <Card className="finance-card p-8 text-center">
        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Financial Goals Yet</h3>
        <p className="text-muted-foreground">
          Create your first financial goal to start tracking your progress.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => {
        const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
        const completed = isCompleted(goal.currentAmount, goal.targetAmount);
        const daysLeft = getDaysLeft(goal.deadline);

        return (
          <Card key={goal.id} className="finance-card p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{goal.title}</h3>
                  <Badge className={getTypeColor(goal.type)}>
                    {getTypeLabel(goal.type)}
                  </Badge>
                  {completed && (
                    <Badge className="bg-success text-success-foreground">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>

                {goal.description && (
                  <p className="text-muted-foreground mb-3">{goal.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-medium">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <Progress value={progress} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress.toFixed(1)}% completed</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}
                    </span>
                  </div>
                </div>

                {goal.category && (
                  <p className="text-sm text-muted-foreground">Category: {goal.category}</p>
                )}
              </div>

              <div className="flex flex-col gap-2 min-w-[120px]">
                {!completed && (
                  <Button
                    size="sm"
                    onClick={() => {
                      const amount = prompt('Add progress amount (BRL):');
                      if (amount && !isNaN(parseFloat(amount))) {
                        onUpdateProgress(goal.id, parseFloat(amount));
                      }
                    }}
                    className="finance-gradient"
                  >
                    Add Progress
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDeleteGoal(goal.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};