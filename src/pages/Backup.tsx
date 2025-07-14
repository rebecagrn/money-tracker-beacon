import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Upload,
  Database,
  FileText,
  CheckCircle,
  AlertTriangle,
  Info,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Transaction, FinancialGoal } from "@/types/finance";
import { useToast } from "@/hooks/use-toast";

interface BackupData {
  transactions: Transaction[];
  goals: FinancialGoal[];
  settings: {
    netIncome?: number;
    defaultCurrency?: string;
    wallets?: string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categories?: any[];
  };
  metadata: {
    exportDate: string;
    version: string;
    totalTransactions: number;
    totalGoals: number;
  };
}

export const Backup = () => {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState<BackupData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get all data from localStorage
  const getAllData = (): BackupData => {
    const transactions: Transaction[] = JSON.parse(
      localStorage.getItem("finance-transactions") || "[]"
    );
    const goals: FinancialGoal[] = JSON.parse(
      localStorage.getItem("finance-goals") || "[]"
    );
    const netIncome = localStorage.getItem("budget-net-income");
    const defaultCurrency = localStorage.getItem("default-currency") || "BRL";
    const wallets = JSON.parse(
      localStorage.getItem("finance-wallets") || '["Main Wallet"]'
    );
    const categories = JSON.parse(
      localStorage.getItem("finance-categories") || "[]"
    );

    return {
      transactions,
      goals,
      settings: {
        netIncome: netIncome ? parseFloat(netIncome) : undefined,
        defaultCurrency,
        wallets,
        categories,
      },
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        totalTransactions: transactions.length,
        totalGoals: goals.length,
      },
    };
  };

  // Export data to JSON file
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = getAllData();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `finance-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Backup Exported",
        description: `Successfully exported ${data.metadata.totalTransactions} transactions and ${data.metadata.totalGoals} goals.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Handle file selection for import
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data: BackupData = JSON.parse(content);

        // Validate the backup data structure
        if (!data.transactions || !data.goals || !data.metadata) {
          throw new Error("Invalid backup file format");
        }

        setImportData(data);
        setShowPreview(true);
        toast({
          title: "File Loaded",
          description: `Found ${data.metadata.totalTransactions} transactions and ${data.metadata.totalGoals} goals.`,
        });
      } catch (error) {
        toast({
          title: "Invalid File",
          description: "Please select a valid backup file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  // Import data from JSON file
  const handleImport = async () => {
    if (!importData) return;

    setIsImporting(true);
    try {
      // Backup current data before import
      const currentData = getAllData();
      const backupBlob = new Blob([JSON.stringify(currentData, null, 2)], {
        type: "application/json",
      });
      const backupUrl = window.URL.createObjectURL(backupBlob);
      const backupLink = document.createElement("a");
      backupLink.href = backupUrl;
      backupLink.download = `finance-backup-before-import-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(backupLink);
      backupLink.click();
      document.body.removeChild(backupLink);
      window.URL.revokeObjectURL(backupUrl);

      // Import new data
      localStorage.setItem(
        "finance-transactions",
        JSON.stringify(importData.transactions)
      );
      localStorage.setItem("finance-goals", JSON.stringify(importData.goals));

      if (importData.settings.netIncome) {
        localStorage.setItem(
          "budget-net-income",
          importData.settings.netIncome.toString()
        );
      }
      if (importData.settings.defaultCurrency) {
        localStorage.setItem(
          "default-currency",
          importData.settings.defaultCurrency
        );
      }
      if (importData.settings.wallets) {
        localStorage.setItem(
          "finance-wallets",
          JSON.stringify(importData.settings.wallets)
        );
      }
      if (importData.settings.categories) {
        localStorage.setItem(
          "finance-categories",
          JSON.stringify(importData.settings.categories)
        );
      }

      setImportData(null);
      setShowPreview(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Import Successful",
        description: `Successfully imported ${importData.metadata.totalTransactions} transactions and ${importData.metadata.totalGoals} goals.`,
      });

      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  // Clear all data
  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      localStorage.removeItem("finance-transactions");
      localStorage.removeItem("finance-goals");
      localStorage.removeItem("budget-net-income");
      localStorage.removeItem("default-currency");
      localStorage.removeItem("finance-wallets");
      localStorage.removeItem("finance-categories");

      toast({
        title: "Data Cleared",
        description: "All financial data has been cleared.",
      });

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const currentData = getAllData();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("backup.title")}
          </h1>
          <p className="text-muted-foreground">{t("backup.subtitle")}</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Database className="w-3 h-3 mr-1" />
          {t("backup.localStorage")}
        </Badge>
      </div>

      {/* Current Data Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          {t("backup.currentSummary")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {currentData.metadata.totalTransactions}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("backup.transactions")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {currentData.metadata.totalGoals}
            </p>
            <p className="text-sm text-muted-foreground">{t("backup.goals")}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {currentData.settings.wallets?.length || 1}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("backup.wallets")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {currentData.settings.defaultCurrency || "BRL"}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("backup.defaultCurrency")}
            </p>
          </div>
        </div>
      </Card>

      {/* Export Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
            <Download className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t("backup.export")}</h3>
            <p className="text-muted-foreground">{t("backup.exportDesc")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t("backup.exportBenefits")}
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• {t("backup.exportBenefit1")}</li>
            <li>• {t("backup.exportBenefit2")}</li>
            <li>• {t("backup.exportBenefit3")}</li>
          </ul>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isExporting ? t("backup.exporting") : t("backup.exportData")}
          </Button>
        </div>
      </Card>

      {/* Import Section */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
            <Upload className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{t("backup.import")}</h3>
            <p className="text-muted-foreground">{t("backup.importDesc")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>{t("common.warning")}:</strong>{" "}
              {t("backup.importWarning")}
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="import-file">{t("backup.selectFile")}</Label>
            <Input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              {t("backup.fileHelper")}
            </p>
          </div>

          {showPreview && importData && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>
                  <strong>{t("backup.filePreview")}:</strong>{" "}
                  {t("backup.filePreviewDesc", {
                    transactions: importData.metadata.totalTransactions,
                    goals: importData.metadata.totalGoals,
                    date: new Date(
                      importData.metadata.exportDate
                    ).toLocaleDateString(),
                  })}
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="gap-2"
                >
                  {isImporting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isImporting ? t("backup.importing") : t("backup.importData")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setImportData(null);
                    setShowPreview(false);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Clear Data Section */}
      <Card className="p-6 border-destructive/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-destructive">
              {t("backup.clear")}
            </h3>
            <p className="text-muted-foreground">{t("backup.clearDesc")}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Alert className="border-destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>{t("backup.dangerZone")}:</strong>{" "}
              {t("backup.clearWarning")}
            </AlertDescription>
          </Alert>

          <Button
            variant="destructive"
            onClick={handleClearData}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {t("backup.clearData")}
          </Button>
        </div>
      </Card>
    </div>
  );
};
