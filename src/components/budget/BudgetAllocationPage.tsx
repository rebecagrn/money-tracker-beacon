import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, DollarSign, Loader2 } from "lucide-react";
import { Transaction } from "@/types/finance";
import { BudgetAllocationOverview } from "./BudgetAllocationOverview";
import { calculateBudgetAllocation } from "@/utils/budgetAllocation";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface BudgetAllocationPageProps {
  transactions: Transaction[];
  className?: string;
}

function getPeriodStart(period: "monthly" | "yearly"): Date {
  const now = new Date();
  if (period === "monthly") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    return new Date(now.getFullYear(), 0, 1);
  }
}

export const BudgetAllocationPage: React.FC<BudgetAllocationPageProps> = ({
  transactions,
  className = "",
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");
  const { toast } = useToast();

  // Auto-calculate net income from all income transactions for the selected period
  const periodStart = getPeriodStart(period);
  const incomeTransactions = transactions.filter(
    (t) => t.type === "income" && new Date(t.date) >= periodStart
  );
  const netIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  const budgetData =
    netIncome > 0
      ? calculateBudgetAllocation(transactions, netIncome, period)
      : null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {t("budget.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("budget.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            <DollarSign className="w-3 h-3 mr-1" />
            {t("budget.netIncome")}:{" "}
            {netIncome.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </Badge>
          <select
            className="ml-2 border rounded px-2 py-1 text-sm bg-background"
            value={period}
            onChange={(e) => setPeriod(e.target.value as "monthly" | "yearly")}
          >
            <option value="monthly">{t("dashboard.thisMonth")}</option>
            <option value="yearly">{t("dashboard.thisMonth")}</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {t("budget.overview")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {netIncome === 0 ? (
            <Card className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <BarChart3 className="w-16 h-16 text-muted-foreground" />
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {t("dashboard.income")}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {t("transactions.addTransaction")}
                  </p>
                </div>
              </div>
            </Card>
          ) : budgetData ? (
            <BudgetAllocationOverview data={budgetData} />
          ) : (
            <Card className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p>{t("common.loading")}</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      {budgetData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {budgetData.allocations.filter((a) => a.status === "safe").length}
            </p>
            <p className="text-sm text-muted-foreground">{t("budget.onTrack")}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {
                budgetData.allocations.filter((a) => a.status === "warning")
                  .length
              }
            </p>
            <p className="text-sm text-muted-foreground">{t("budget.warning")}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {budgetData.allocations.filter((a) => a.status === "over").length}
            </p>
            <p className="text-sm text-muted-foreground">{t("budget.overBudget")}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {budgetData.recommendations.length}
            </p>
            <p className="text-sm text-muted-foreground">{t("budget.recommendations")}</p>
          </Card>
        </div>
      )}
    </div>
  );
};
