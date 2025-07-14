import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { FinancialGoal } from "@/types/finance";
import { Plus } from "lucide-react";

interface GoalFormProps {
  onAddGoal: (goal: Omit<FinancialGoal, "id">) => void;
}

export const GoalForm = ({ onAddGoal }: GoalFormProps) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    category: "",
    type: "save" as "save" | "spend_less" | "earn_more",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.targetAmount || !formData.deadline) return;

    onAddGoal({
      title: formData.title,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      deadline: formData.deadline,
      category: formData.category,
      type: formData.type,
    });

    setFormData({
      title: "",
      description: "",
      targetAmount: "",
      currentAmount: "",
      deadline: "",
      category: "",
      type: "save",
    });
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className="finance-gradient gap-2 mb-6"
      >
        <Plus className="w-4 h-4" />
        {t("goals.addGoal")}
      </Button>
    );
  }

  return (
    <Card className="finance-card p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {t("goals.createGoal", "Create New Financial Goal")}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">{t("goals.goalName")}</Label>
            <Input
              id="title"
              placeholder={t(
                "goals.goalNamePlaceholder",
                "e.g. Emergency Fund, New Car"
              )}
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="type">{t("goals.goalType")}</Label>
            <Select
              value={formData.type}
              onValueChange={(value: "save" | "spend_less" | "earn_more") =>
                setFormData((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="save">{t("goals.saveMoney")}</SelectItem>
                <SelectItem value="spend_less">
                  {t("goals.spendLess")}
                </SelectItem>
                <SelectItem value="earn_more">{t("goals.earnMore")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">{t("goals.description")}</Label>
          <Textarea
            id="description"
            placeholder={t(
              "goals.goalDescription",
              "Describe your goal and how you plan to achieve it"
            )}
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="targetAmount">{t("goals.targetAmount")}</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              placeholder="10000.00"
              value={formData.targetAmount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  targetAmount: e.target.value,
                }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="currentAmount">{t("goals.currentAmount")}</Label>
            <Input
              id="currentAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.currentAmount}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currentAmount: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <Label htmlFor="deadline">{t("goals.deadline")}</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, deadline: e.target.value }))
              }
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">
            {t("goals.category")} ({t("common.optional", "Optional")})
          </Label>
          <Input
            id="category"
            placeholder={t(
              "goals.categoryPlaceholder",
              "e.g. Travel, Housing, Education"
            )}
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, category: e.target.value }))
            }
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="finance-gradient">
            {t("goals.save", "Create Goal")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(false)}
          >
            {t("common.cancel")}
          </Button>
        </div>
      </form>
    </Card>
  );
};
