import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  // Determine flag based on language
  const getFlag = (lang: string) => {
    switch (lang) {
      case "pt-BR":
        return "🇧🇷";
      case "en":
        return "🇺🇸";
      default:
        return "🏳️";
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[120px] h-8 border-none bg-transparent">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pt-BR">
            <span className="mr-1">🇧🇷</span>
            {t("common.portuguese")}
          </SelectItem>
          <SelectItem value="en">
            <span className="mr-1">🇺🇸</span>
            {t("common.english")}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
