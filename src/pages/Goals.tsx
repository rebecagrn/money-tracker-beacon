import { useState, useEffect } from 'react';
import { GoalsOverview } from '@/components/goals/GoalsOverview';
import { GoalForm } from '@/components/goals/GoalForm';
import { GoalsList } from '@/components/goals/GoalsList';
import { FinancialGoal } from '@/types/finance';
import { useToast } from '@/hooks/use-toast';

export const Goals = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const { toast } = useToast();

  // Load goals from localStorage on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('finance-goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('finance-goals', JSON.stringify(goals));
  }, [goals]);

  const addGoal = (newGoal: Omit<FinancialGoal, 'id'>) => {
    const goal: FinancialGoal = {
      ...newGoal,
      id: Date.now().toString()
    };
    setGoals(prev => [goal, ...prev]);
    toast({
      title: 'Goal Created',
      description: `Your goal "${goal.title}" has been created successfully.`,
    });
  };

  const deleteGoal = (id: string) => {
    const goal = goals.find(g => g.id === id);
    setGoals(prev => prev.filter(g => g.id !== id));
    toast({
      title: 'Goal Deleted',
      description: `Goal "${goal?.title}" has been removed.`,
    });
  };

  const updateProgress = (id: string, amount: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === id) {
        const newAmount = goal.currentAmount + amount;
        const completed = newAmount >= goal.targetAmount;
        
        if (completed && goal.currentAmount < goal.targetAmount) {
          toast({
            title: 'Goal Completed! 🎉',
            description: `Congratulations! You've achieved your goal: ${goal.title}`,
          });
        }
        
        return { ...goal, currentAmount: newAmount };
      }
      return goal;
    }));
  };

  return (
    <div className="min-h-screen dashboard-bg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Financial Goals</h1>
            <p className="text-muted-foreground mt-1">
              Set and track your financial objectives
            </p>
          </div>
        </div>

        {/* Overview */}
        <GoalsOverview goals={goals} />

        {/* Add Goal Form */}
        <GoalForm onAddGoal={addGoal} />

        {/* Goals List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Goals</h2>
          <GoalsList 
            goals={goals} 
            onDeleteGoal={deleteGoal}
            onUpdateProgress={updateProgress}
          />
        </div>
      </div>
    </div>
  );
};