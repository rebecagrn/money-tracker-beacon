import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Gift,
  PiggyBank,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { BudgetAllocationSummary } from "@/types/finance";
import {
  formatAllocationAmount,
  getStatusColor,
  getStatusText,
} from "@/utils/budgetAllocation";

interface BudgetAllocationOverviewProps {
  data: BudgetAllocationSummary;
  className?: string;
}

export const BudgetAllocationOverview: React.FC<
  BudgetAllocationOverviewProps
> = ({ data, className = "" }) => {
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

  const getStatusIcon = (status: "safe" | "warning" | "over") => {
    switch (status) {
      case "safe":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "over":
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            50/30/20 Budget Allocation
          </h2>
          <p className="text-muted-foreground">
            Based on your net income of {formatAllocationAmount(data.netIncome)}
          </p>
        </div>
        <Badge
          variant={data.overallStatus === "safe" ? "default" : "destructive"}
          className="text-sm"
        >
          {getStatusIcon(data.overallStatus)}
          <span className="ml-1">{getStatusText(data.overallStatus)}</span>
        </Badge>
      </div>

      {/* Allocation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.allocations.map((allocation) => {
          const progressPercentage =
            allocation.amount > 0
              ? Math.min((allocation.spent / allocation.amount) * 100, 100)
              : 0;

          return (
            <Card
              key={allocation.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
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
                    <h3 className="font-semibold text-foreground">
                      {allocation.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {allocation.percentage}%
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    allocation.status === "safe" ? "secondary" : "destructive"
                  }
                  className="text-xs"
                >
                  {getStatusText(allocation.status)}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium">
                    {formatAllocationAmount(allocation.amount)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Spent</span>
                  <span className="font-medium">
                    {formatAllocationAmount(allocation.spent)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span
                    className={`font-medium ${
                      allocation.remaining < 0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {formatAllocationAmount(allocation.remaining)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={progressPercentage}
                    className="h-2"
                    style={
                      {
                        "--progress-background": getStatusColor(
                          allocation.status
                        ),
                      } as React.CSSProperties
                    }
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  {allocation.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">
            {formatAllocationAmount(data.totalSpent)}
          </p>
          <p className="text-sm text-muted-foreground">Total Spent</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-500">
            {formatAllocationAmount(data.totalRemaining)}
          </p>
          <p className="text-sm text-muted-foreground">Total Remaining</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">
            {data.netIncome > 0
              ? ((data.totalSpent / data.netIncome) * 100).toFixed(1)
              : 0}
            %
          </p>
          <p className="text-sm text-muted-foreground">Budget Used</p>
        </Card>
      </div>

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Recommendations
          </h3>
          <div className="space-y-3">
            {data.recommendations.map((recommendation, index) => (
              <Alert key={index} className="border-l-4 border-l-blue-500">
                <AlertDescription className="text-sm">
                  {recommendation}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </Card>
      )}

      {/* 50/30/20 Rule Explanation */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <h3 className="text-lg font-semibold mb-4">About the 50/30/20 Rule</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-red-600 mb-2">50% - Needs</h4>
            <p className="text-muted-foreground">
              Essential expenses: housing, utilities, food, transportation, and
              healthcare.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-yellow-600 mb-2">30% - Wants</h4>
            <p className="text-muted-foreground">
              Discretionary spending: entertainment, dining out, shopping, and
              hobbies.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-green-600 mb-2">20% - Savings</h4>
            <p className="text-muted-foreground">
              Financial goals: emergency fund, retirement, debt repayment, and
              investments.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
