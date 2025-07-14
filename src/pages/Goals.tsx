import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { GoalsOverview } from "@/components/goals/GoalsOverview";
import { GoalForm } from "@/components/goals/GoalForm";
import { GoalsList } from "@/components/goals/GoalsList";
import { FinancialGoal } from "@/types/finance";
import { useToast } from "@/hooks/use-toast";

export const Goals = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Load goals from localStorage on mount
  useEffect(() => {
    const savedGoals = localStorage.getItem("finance-goals");
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Save goals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("finance-goals", JSON.stringify(goals));
  }, [goals]);

  const addGoal = (newGoal: Omit<FinancialGoal, "id">) => {
    const goal: FinancialGoal = {
      ...newGoal,
      id: Date.now().toString(),
    };
    setGoals((prev) => [goal, ...prev]);
    toast({
      title: t("goals.addGoal"),
      description: t("goals.goalCreated", { title: goal.title }),
    });
  };

  const deleteGoal = (id: string) => {
    const goal = goals.find((g) => g.id === id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
    toast({
      title: t("goals.delete"),
      description: t("goals.goalDeleted", { title: goal?.title }),
    });
  };

  const updateProgress = (id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((goal) => {
        if (goal.id === id) {
          const newAmount = goal.currentAmount + amount;
          const completed = newAmount >= goal.targetAmount;

          if (completed && goal.currentAmount < goal.targetAmount) {
            toast({
              title: t("goals.completed") + " 🎉",
              description: t("goals.goalCompleted", { title: goal.title }),
            });
          }

          return { ...goal, currentAmount: newAmount };
        }
        return goal;
      })
    );
  };

  return (
    <div className="min-h-screen dashboard-bg p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t("goals.title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("goals.overview")}</p>
          </div>
        </div>

        {/* Overview */}
        <GoalsOverview goals={goals} />

        {/* Add Goal Form */}
        <GoalForm onAddGoal={addGoal} />

        {/* Goals List */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {t("goals.financialGoals")}
          </h2>
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
