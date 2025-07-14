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

export const Dashboard = () => {
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
      title: "Transaction Updated",
      description: "The transaction has been successfully updated.",
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
      title: "Transactions Imported",
      description: `${importedTransactions.length} transactions have been added.`,
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    toast({
      title: "Transaction Deleted",
      description: "The transaction has been removed from your records.",
    });
  };

  const summary = getFinancialSummary(transactions, "monthly");

  // Prepare chart data
  const chartData = summary.topCategories.map((cat, index) => {
    const categoryInfo = defaultCategories.find((c) => c.id === cat.category);
    return {
      name: categoryInfo?.name || cat.category,
      value: cat.amount,
      color: categoryInfo?.color || "#666666",
      percentage: cat.percentage,
    };
  });

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
      title: "Data Exported",
      description: "Your financial data has been exported to CSV.",
    });
  };

  // Show calculator section if requested
  if (currentSection === "calculator") {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Net Income Calculator</h2>
          <Button onClick={exportToCsv} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        <Card className="finance-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 finance-gradient rounded-xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                Calculate Your Net Income
              </h3>
              <p className="text-muted-foreground">
                Enter your gross income and tax rate
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Gross Income
              </label>
              <Input
                type="number"
                placeholder="Enter gross income"
                value={grossIncome}
                onChange={(e) => setGrossIncome(e.target.value)}
                className="text-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tax Rate (%)
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
          <h2 className="text-2xl font-bold">Spending Analysis</h2>
          <div className="flex gap-3">
            <Button onClick={exportToCsv} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
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
          title="Spending by Category"
          type={chartType}
          currency={summary.currency}
        />
      </div>
    );
  }

  return (
    <div className="dashboard-bg min-h-full">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back!
            </h1>
            <p className="text-muted-foreground">
              Here's your financial overview for today
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={exportToCsv} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="finance-gradient gap-2"
            >
              <Plus className="w-4 h-4" />
              {showForm ? "Close" : "Add Transaction"}
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
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="import">Import Bills</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
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
                  <h3 className="text-lg font-semibold">Recent Transactions</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTabChange("transactions")}
                  >
                    View All
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
                      No transactions yet
                    </p>
                  )}
                </div>
              </Card>

              {/* Spending Chart */}
              <Card className="finance-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Spending Overview</h3>
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
                  title=""
                  type={chartType}
                  currency={summary.currency}
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
            <p className="text-sm text-muted-foreground">Total Transactions</p>
          </Card>
          <Card className="finance-card p-4 text-center hover:scale-105 transition-transform">
            <p className="text-2xl font-bold text-success">
              {transactions.filter((t) => t.type === "income").length}
            </p>
            <p className="text-sm text-muted-foreground">Income Entries</p>
          </Card>
          <Card className="finance-card p-4 text-center hover:scale-105 transition-transform">
            <p className="text-2xl font-bold text-warning">
              {transactions.filter((t) => t.type === "expense").length}
            </p>
            <p className="text-sm text-muted-foreground">Expense Entries</p>
          </Card>
          <Card className="finance-card p-4 text-center hover:scale-105 transition-transform">
            <p className="text-2xl font-bold text-foreground">
              {summary.savingsRate.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">Savings Rate</p>
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
