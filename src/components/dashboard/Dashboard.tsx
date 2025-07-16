import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FinancialOverview } from "./FinancialOverview";
import { TransactionForm } from "../transactions/TransactionForm";
import { TransactionList } from "../transactions/TransactionList";
import { TransactionEditModal } from "../transactions/TransactionEditModal";
import { SpendingChart } from "../charts/SpendingChart";
import { BillImporter } from "../bills/BillImporter";
import { BalanceForecast } from "../forecast/BalanceForecast";
import { BudgetAllocationPage } from "../budget/BudgetAllocationPage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  BarChart,
  Calculator,
  Download,
  Upload,
  TrendingUp,
  Plus,
} from "lucide-react";
import { Transaction } from "@/types/finance";
import {
  getFinancialSummary,
  calculateNetIncome,
  formatCurrency,
} from "@/utils/financeCalculations";
import { defaultCategories } from "@/data/defaultCategories";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/formatDate";
import { useTranslation } from "react-i18next";

export const Dashboard = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab") || "overview";
  const currentSection = searchParams.get("section");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");
  const [chartPeriod, setChartPeriod] = useState("month");
  const [grossIncome, setGrossIncome] = useState("");
  const [taxRate, setTaxRate] = useState(6);
  const { toast } = useToast();

  // Handle URL tab changes
  const handleTabChange = (tab: string) => {
    const newSearchParams = new URLSearchParams();
    if (tab !== "overview") {
      newSearchParams.set("tab", tab);
    }
    navigate({ search: newSearchParams.toString() });
  };

  // Load transactions from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem("finance-transactions");
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("finance-transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (newTransaction: Omit<Transaction, "id">) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [transaction, ...prev]);
    setShowForm(false);
  };

  const editTransaction = (updatedTransaction: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
    toast({
      title: t("transactions.edit"),
      description: t("transactions.save"),
    });
  };

  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingTransaction(null);
  };

  const importTransactions = (importedTransactions: Transaction[]) => {
    setTransactions((prev) => [...importedTransactions, ...prev]);
    toast({
      title: t("dashboard.importBills"),
      description: `${importedTransactions.length} ${t(
        "transactions.title"
      ).toLowerCase()}`,
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast({
      title: t("transactions.delete"),
      description: t("transactions.cancel"),
    });
  };

  const summary = getFinancialSummary(transactions, "monthly");

  // Prepare chart data with period filter
  const chartData = (() => {
    const now = new Date();
    let startDate = new Date();
    
    // Set start date based on selected period
    switch (chartPeriod) {
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "3months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "6months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0); // All time
    }
    
    const filteredTransactions = transactions.filter(t => 
      t.type === 'expense' && new Date(t.date) >= startDate
    );
    
    const categoryTotals = new Map<string, number>();
    
    filteredTransactions.forEach(transaction => {
      const categoryInfo = defaultCategories.find(c => c.id === transaction.category);
      const categoryName = categoryInfo?.name || transaction.category;
      const currentAmount = categoryTotals.get(categoryName) || 0;
      categoryTotals.set(categoryName, currentAmount + transaction.amount);
    });

    const total = Array.from(categoryTotals.values()).reduce((sum, amount) => sum + amount, 0);
    
    return Array.from(categoryTotals.entries()).map(([name, value]) => {
      const categoryInfo = defaultCategories.find(c => c.name === name);
      return {
        name,
        value,
        color: categoryInfo?.color || "#666666",
        percentage: total > 0 ? (value / total) * 100 : 0
      };
    }).sort((a, b) => b.value - a.value);
  })();

  // Calculate net income
  const netIncomeCalc = grossIncome
    ? calculateNetIncome(parseFloat(grossIncome), taxRate)
    : null;

  const exportToCsv = () => {
    const csvContent = transactions
      .map(
        (t) =>
          `${t.date},${t.type},${t.amount},${t.category},${t.description},${t.currency}`
      )
      .join("\n");

    const csvHeader = "Date,Type,Amount,Category,Description,Currency\n";
    const fullCsv = csvHeader + csvContent;

    const blob = new Blob([fullCsv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-data-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    toast({
      title: t("backup.exportSuccess"),
      description: t("backup.exportDesc"),
    });
  };

  // Show calculator section if requested
  if (currentSection === "calculator") {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("dashboard.netIncome")}</h2>
          <Button onClick={exportToCsv} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            {t("backup.export")}
          </Button>
        </div>

        <Card className="finance-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 finance-gradient rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">{t("budget.netIncome")}</h3>
              <p className="text-muted-foreground">{t("budget.grossIncome")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("budget.grossIncome")}
              </label>
              <Input
                type="number"
                placeholder={t("budget.grossIncome")}
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value)}
                className="text-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t("budget.taxRate")}
              </label>
              <Input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                step="0.1"
                min="0"
                max="100"
                className="text-lg"
              />
            </div>
            <div className="flex flex-col justify-end">
              {netIncomeCalc && (
                <div className="p-4 bg-success-light rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Tax: {formatCurrency(netIncomeCalc.tax)}
                  </p>
                  <p className="text-2xl font-bold text-success">
                    Net: {formatCurrency(netIncomeCalc.net)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Show chart section if requested
  if (currentSection === "chart") {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {t("dashboard.spendingAnalysis")}
          </h2>
          <div className="flex gap-3">
            <Button onClick={exportToCsv} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              {t("backup.export")}
            </Button>
            <div className="flex gap-2">
              <Button
                variant={chartType === "pie" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("pie")}
                className="gap-2"
              >
                <PieChart className="w-4 h-4" />
                Pie
              </Button>
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("bar")}
                className="gap-2"
              >
                <BarChart className="w-4 h-4" />
                Bar
              </Button>
            </div>
          </div>
        </div>

        <SpendingChart
          data={chartData}
          title={t("dashboard.spendingAnalysis")}
          type={chartType}
          currency={summary.currency}
        />
      </div>
    );
  }

  const handleAddTransactionClick = () => {
    if (currentTab !== "overview") {
      handleTabChange("overview");
      setShowForm(true);
    } else {
      setShowForm((prev) => !prev);
    }
  };

  return (
    <div className="dashboard-bg min-h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {t("dashboard.title")}
            </h1>
            <p className="text-muted-foreground">{t("dashboard.overview")}</p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleAddTransactionClick}
              className="finance-gradient gap-2"
            >
              <Plus className="w-4 h-4" />
              {showForm ? t("common.close") : t("transactions.addTransaction")}
            </Button>
          </div>
        </div>

        {/* Financial Overview */}
        <FinancialOverview data={summary} />

        {/* Main Content Tabs */}
        <Tabs
          value={currentTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              {t("dashboard.overview")}
            </TabsTrigger>
            <TabsTrigger value="transactions">
              {t("dashboard.transactions")}
            </TabsTrigger>
            <TabsTrigger value="budget">{t("budget.title")}</TabsTrigger>
            <TabsTrigger value="import">
              {t("dashboard.importBills")}
            </TabsTrigger>
            <TabsTrigger value="forecast">
              {t("dashboard.forecast")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {showForm && (
              <div className="animate-fade-in">
                <TransactionForm onAddTransaction={addTransaction} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions Preview */}
              <Card className="finance-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {t("dashboard.transactions")}
                  </h3>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => handleTabChange("transactions")}
                  >
                    {t("navigation.button")}
                  </Button>
                </div>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-background rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {transaction.description || "Transaction"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                      <div
                        className={`font-semibold ${
                          transaction.type === "income"
                            ? "text-success"
                            : "text-warning"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      {t("transactions.noTransactions")}
                    </p>
                  )}
                </div>
              </Card>

              {/* Spending Chart */}
              <Card className="finance-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {t("dashboard.spendingAnalysis")}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant={chartType === "pie" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartType("pie")}
                    >
                      <PieChart className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={chartType === "bar" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartType("bar")}
                    >
                      <BarChart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <SpendingChart
                  data={chartData}
                  title={t("charts.spendingAnalysis")}
                  type={chartType}
                  currency={summary.currency}
                  showPeriodFilter={true}
                  onPeriodChange={setChartPeriod}
                />
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionList
              transactions={transactions}
              onDeleteTransaction={deleteTransaction}
              onEditTransaction={handleEditClick}
            />
          </TabsContent>

          <TabsContent value="budget">
            <BudgetAllocationPage transactions={transactions} />
          </TabsContent>

          <TabsContent value="import">
            <BillImporter onImportTransactions={importTransactions} />
          </TabsContent>

          <TabsContent value="forecast">
            <BalanceForecast
              transactions={transactions}
              currentBalance={summary.balance}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="finance-card p-4 text-center hover:scale-105 transition-transform">
            <p className="text-2xl font-bold text-primary">
              {transactions.length}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("backup.transactions")}
            </p>
          </Card>
          <Card className="finance-card p-4 text-center hover:scale-105 transition-transform">
            <p className="text-2xl font-bold text-success">
              {transactions.filter((t) => t.type === "income").length}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.income")}
            </p>
          </Card>
          <Card className="finance-card p-4 text-center hover:scale-105 transition-transform">
            <p className="text-2xl font-bold text-warning">
              {transactions.filter((t) => t.type === "expense").length}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.expenses")}
            </p>
          </Card>
          <Card className="finance-card p-4 text-center hover:scale-105 transition-transform">
            <p className="text-2xl font-bold text-foreground">
              {summary.savingsRate.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">
              {t("budget.savings")}
            </p>
          </Card>
        </div>
      </div>

      {/* Transaction Edit Modal */}
      <TransactionEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        transaction={editingTransaction}
        onEditTransaction={editTransaction}
        onAddTransaction={addTransaction}
      />
    </div>
  );
};
