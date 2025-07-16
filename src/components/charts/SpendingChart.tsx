import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Filter } from 'lucide-react';
import { formatCurrency } from "@/utils/financeCalculations";
import { useTranslation } from 'react-i18next';

interface ChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface SpendingChartProps {
  data: ChartData[];
  title: string;
  type?: "pie" | "bar";
  currency?: string;
  showPeriodFilter?: boolean;
  onPeriodChange?: (period: string) => void;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

export const SpendingChart = ({
  data,
  title,
  type = "pie",
  currency = "USD",
  showPeriodFilter = false,
  onPeriodChange
}: SpendingChartProps) => {
  const { t } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    onPeriodChange?.(period);
  };

  const totalAmount = data.reduce((sum, item) => sum + item.value, 0);
  if (!data || data.length === 0) {
    return (
      <Card className="finance-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 finance-gradient rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          {showPeriodFilter && (
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">{t("filters.thisMonth")}</SelectItem>
                <SelectItem value="3months">{t("filters.last3Months")}</SelectItem>
                <SelectItem value="6months">{t("filters.last6Months")}</SelectItem>
                <SelectItem value="year">{t("filters.thisYear")}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <Filter className="w-12 h-12 mb-4 opacity-50" />
          <p>{t("charts.noData")}</p>
        </div>
      </Card>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.payload.name}</p>
          <p className="text-primary">{formatCurrency(data.value, currency)}</p>
          <p className="text-sm text-muted-foreground">
            {data.payload.percentage.toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="finance-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 finance-gradient rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {t("charts.total")}: {formatCurrency(totalAmount, currency)}
          </Badge>
          {showPeriodFilter && (
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">{t("filters.thisMonth")}</SelectItem>
                <SelectItem value="3months">{t("filters.last3Months")}</SelectItem>
                <SelectItem value="6months">{t("filters.last6Months")}</SelectItem>
                <SelectItem value="year">{t("filters.thisYear")}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {type === "pie" ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }) =>
                  `${name} ${percentage.toFixed(1)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--foreground))"
                fontSize={12}
                tickFormatter={(value) => formatCurrency(value, currency)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm font-medium truncate">{item.name}</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {item.percentage.toFixed(1)}%
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
