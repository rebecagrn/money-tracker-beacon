import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calculator,
  DollarSign,
  Percent,
  Shield,
  Gift,
  PiggyBank,
  Info,
  TrendingUp,
} from "lucide-react";
import { calculateNetIncome } from "@/utils/financeCalculations";
import { formatAllocationAmount } from "@/utils/budgetAllocation";
import { BudgetAllocation } from "@/types/finance";

interface BudgetAllocationCalculatorProps {
  onCalculate?: (netIncome: number, allocations: BudgetAllocation[]) => void;
  className?: string;
}

export const BudgetAllocationCalculator: React.FC<
  BudgetAllocationCalculatorProps
> = ({ onCalculate, className = "" }) => {
  const [grossIncome, setGrossIncome] = useState("");
  const [taxRate, setTaxRate] = useState(6);
  const [netIncome, setNetIncome] = useState(0);
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);

  useEffect(() => {
    if (grossIncome && !isNaN(parseFloat(grossIncome))) {
      const income = parseFloat(grossIncome);
      const netIncomeCalc = calculateNetIncome(income, taxRate);
      setNetIncome(netIncomeCalc.net);

      // Calculate 50/30/20 allocations
      const newAllocations: BudgetAllocation[] = [
        {
          id: "needs",
          name: "Needs (50%)",
          percentage: 50,
          amount: netIncomeCalc.net * 0.5,
          color: "#ef4444",
          icon: "shield",
          description:
            "Essential expenses: housing, utilities, food, transportation, healthcare",
          categories: ["rent", "utilities", "food", "transport", "healthcare"],
          spent: 0,
          remaining: netIncomeCalc.net * 0.5,
          status: "safe",
        },
        {
          id: "wants",
          name: "Wants (30%)",
          percentage: 30,
          amount: netIncomeCalc.net * 0.3,
          color: "#f59e0b",
          icon: "gift",
          description:
            "Discretionary spending: entertainment, shopping, subscriptions",
          categories: [
            "entertainment",
            "shopping",
            "subscriptions",
            "travel",
            "dining",
            "personal-care",
            "gifts",
          ],
          spent: 0,
          remaining: netIncomeCalc.net * 0.3,
          status: "safe",
        },
        {
          id: "savings",
          name: "Savings (20%)",
          percentage: 20,
          amount: netIncomeCalc.net * 0.2,
          color: "#10b981",
          icon: "piggy-bank",
          description:
            "Financial goals: emergency fund, retirement, debt repayment",
          categories: ["investments", "other-income"],
          spent: 0,
          remaining: netIncomeCalc.net * 0.2,
          status: "safe",
        },
      ];

      setAllocations(newAllocations);

      if (onCalculate) {
        onCalculate(netIncomeCalc.net, newAllocations);
      }
    }
  }, [grossIncome, taxRate, onCalculate]);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "shield":
        return <Shield className="w-5 h-5" />;
      case "gift":
        return <Gift className="w-5 h-5" />;
      case "piggy-bank":
        return <PiggyBank className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const handleIncomeChange = (value: string) => {
    setGrossIncome(value);
  };

  const handleTaxRateChange = (value: string) => {
    const rate = parseFloat(value) || 0;
    setTaxRate(Math.min(Math.max(rate, 0), 100));
  };
  return (
    <div className={`space-y-6 ${className}`}>
      {allocations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            Recommended Budget Allocation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allocations.map((allocation) => (
              <div key={allocation.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${allocation.color}20` }}
                  >
                    <div style={{ color: allocation.color }}>
                      {getIcon(allocation.icon)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold">{allocation.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {allocation.percentage}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: allocation.color }}
                  >
                    {formatAllocationAmount(allocation.amount)}
                  </div>
                  <Progress
                    value={allocation.percentage}
                    className="h-2"
                    style={
                      {
                        "--progress-background": allocation.color,
                      } as React.CSSProperties
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {allocation.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tips and Guidelines */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Budgeting Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-red-600">Needs (50%)</h4>
              <ul className="text-muted-foreground space-y-1 mt-2">
                <li>• Housing: Rent/mortgage, property taxes</li>
                <li>• Utilities: Electricity, water, internet</li>
                <li>• Food: Groceries and essential meals</li>
                <li>• Transportation: Car payments, gas, public transit</li>
                <li>• Healthcare: Insurance, medications, co-pays</li>
              </ul>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-yellow-600">Wants (30%)</h4>
              <ul className="text-muted-foreground space-y-1 mt-2">
                <li>• Entertainment: Movies, concerts, hobbies</li>
                <li>• Dining Out: Restaurants, cafes, takeout</li>
                <li>• Shopping: Clothing, accessories, gadgets</li>
                <li>• Travel: Vacations, weekend trips</li>
                <li>• Subscriptions: Streaming, gym, memberships</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-600">Savings (20%)</h4>
              <ul className="text-muted-foreground space-y-1 mt-2">
                <li>• Emergency Fund: 3-6 months of expenses</li>
                <li>• Retirement: 401(k), IRA contributions</li>
                <li>• Debt Repayment: Credit cards, loans</li>
                <li>• Investments: Stocks, bonds, mutual funds</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
