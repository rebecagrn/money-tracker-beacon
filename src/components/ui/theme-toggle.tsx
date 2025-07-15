import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      title={theme === "light" ? t("common.darkMode") : t("common.lightMode")}
      className="h-9 w-9"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">
        {theme === "light" ? t("common.darkMode") : t("common.lightMode")}
      </span>
    </Button>
  );
}
