import {
  Transaction,
  BudgetAllocation,
  BudgetAllocationRule,
  BudgetAllocationSummary,
} from "@/types/finance";
import { defaultCategories } from "@/data/defaultCategories";

// 50/30/20 Budget Allocation Rule
export const BUDGET_ALLOCATION_RULE: BudgetAllocationRule = {
  needs: {
    percentage: 50,
    categories: ["rent", "utilities", "food", "transport", "healthcare"],
    description:
      "Essential expenses like housing, utilities, food, transportation, and healthcare",
  },
  wants: {
    percentage: 30,
    categories: [
      "entertainment",
      "shopping",
      "subscriptions",
      "travel",
      "dining",
      "personal-care",
      "gifts",
    ],
    description:
      "Discretionary spending like entertainment, shopping, subscriptions, travel, dining, and personal care",
  },
  savings: {
    percentage: 20,
    categories: ["investments", "other-income"],
    description: "Savings, investments, and debt repayment",
  },
};

export const calculateBudgetAllocation = (
  transactions: Transaction[],
  netIncome: number,
  period: "monthly" | "yearly" = "monthly"
): BudgetAllocationSummary => {
  const now = new Date();
  let startDate: Date;

  if (period === "monthly") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  const filteredTransactions = transactions.filter(
    (t) => new Date(t.date) >= startDate
  );

  // Calculate allocations based on 50/30/20 rule
  const allocations: BudgetAllocation[] = [
    {
      id: "needs",
      name: "Needs (50%)",
      percentage: BUDGET_ALLOCATION_RULE.needs.percentage,
      amount: netIncome * (BUDGET_ALLOCATION_RULE.needs.percentage / 100),
      color: "#ef4444",
      icon: "shield",
      description: BUDGET_ALLOCATION_RULE.needs.description,
      categories: BUDGET_ALLOCATION_RULE.needs.categories,
      spent: 0,
      remaining: 0,
      status: "safe",
    },
    {
      id: "wants",
      name: "Wants (30%)",
      percentage: BUDGET_ALLOCATION_RULE.wants.percentage,
      amount: netIncome * (BUDGET_ALLOCATION_RULE.wants.percentage / 100),
      color: "#f59e0b",
      icon: "gift",
      description: BUDGET_ALLOCATION_RULE.wants.description,
      categories: BUDGET_ALLOCATION_RULE.wants.categories,
      spent: 0,
      remaining: 0,
      status: "safe",
    },
    {
      id: "savings",
      name: "Savings (20%)",
      percentage: BUDGET_ALLOCATION_RULE.savings.percentage,
      amount: netIncome * (BUDGET_ALLOCATION_RULE.savings.percentage / 100),
      color: "#10b981",
      icon: "piggy-bank",
      description: BUDGET_ALLOCATION_RULE.savings.description,
      categories: BUDGET_ALLOCATION_RULE.savings.categories,
      spent: 0,
      remaining: 0,
      status: "safe",
    },
  ];

  // Calculate spent amounts for each allocation
  allocations.forEach((allocation) => {
    const spent = filteredTransactions
      .filter(
        (t) =>
          t.type === "expense" && allocation.categories.includes(t.category)
      )
      .reduce((sum, t) => sum + t.amount, 0);

    allocation.spent = spent;
    allocation.remaining = allocation.amount - spent;

    // Determine status based on spending percentage
    const spendingPercentage =
      allocation.amount > 0 ? (spent / allocation.amount) * 100 : 0;
    if (spendingPercentage >= 100) {
      allocation.status = "over";
    } else if (spendingPercentage >= 80) {
      allocation.status = "warning";
    } else {
      allocation.status = "safe";
    }
  });

  const totalSpent = allocations.reduce((sum, a) => sum + a.spent, 0);
  const totalRemaining = allocations.reduce((sum, a) => sum + a.remaining, 0);

  // Determine overall status
  const overallSpendingPercentage =
    netIncome > 0 ? (totalSpent / netIncome) * 100 : 0;
  let overallStatus: "safe" | "warning" | "over" = "safe";
  if (overallSpendingPercentage >= 100) {
    overallStatus = "over";
  } else if (overallSpendingPercentage >= 80) {
    overallStatus = "warning";
  }

  // Generate recommendations
  const recommendations: string[] = [];

  allocations.forEach((allocation) => {
    if (allocation.status === "over") {
      recommendations.push(
        `You're over budget in ${allocation.name.toLowerCase()}. Consider reducing spending in this category.`
      );
    } else if (allocation.status === "warning") {
      recommendations.push(
        `You're approaching the limit for ${allocation.name.toLowerCase()}. Monitor your spending.`
      );
    }
  });

  if (overallStatus === "over") {
    recommendations.push(
      "You're spending more than your net income. Focus on reducing expenses or increasing income."
    );
  } else if (overallStatus === "warning") {
    recommendations.push(
      "You're approaching your budget limit. Review your spending patterns."
    );
  } else {
    recommendations.push(
      "Great job! You're staying within your budget allocation."
    );
  }

  // Add specific recommendations based on spending patterns
  const needsAllocation = allocations.find((a) => a.id === "needs");
  const wantsAllocation = allocations.find((a) => a.id === "wants");
  const savingsAllocation = allocations.find((a) => a.id === "savings");

  if (needsAllocation && needsAllocation.spent > needsAllocation.amount) {
    recommendations.push(
      "Consider reviewing essential expenses like housing, utilities, or transportation to reduce costs."
    );
  }

  if (wantsAllocation && wantsAllocation.spent > wantsAllocation.amount) {
    recommendations.push(
      "Look for ways to reduce discretionary spending on entertainment, shopping, or subscriptions."
    );
  }

  if (
    savingsAllocation &&
    savingsAllocation.spent < savingsAllocation.amount * 0.5
  ) {
    recommendations.push(
      "You have room to increase your savings. Consider setting up automatic transfers to savings accounts."
    );
  }

  return {
    netIncome,
    allocations,
    totalSpent,
    totalRemaining,
    overallStatus,
    recommendations,
  };
};

export const getCategoryAllocation = (categoryId: string): string => {
  if (BUDGET_ALLOCATION_RULE.needs.categories.includes(categoryId)) {
    return "needs";
  } else if (BUDGET_ALLOCATION_RULE.wants.categories.includes(categoryId)) {
    return "wants";
  } else if (BUDGET_ALLOCATION_RULE.savings.categories.includes(categoryId)) {
    return "savings";
  }
  return "other";
};

export const formatAllocationAmount = (
  amount: number,
  currency: string = "BRL"
): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(amount);
};

export const getStatusColor = (status: "safe" | "warning" | "over"): string => {
  switch (status) {
    case "safe":
      return "#10b981";
    case "warning":
      return "#f59e0b";
    case "over":
      return "#ef4444";
    default:
      return "#6b7280";
  }
};

export const getStatusText = (status: "safe" | "warning" | "over"): string => {
  switch (status) {
    case "safe":
      return "On Track";
    case "warning":
      return "Warning";
    case "over":
      return "Over Budget";
    default:
      return "Unknown";
  }
};
