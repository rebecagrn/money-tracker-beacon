import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Index from "./pages/Index";
import { Goals } from "./pages/Goals";
import NotFound from "./pages/NotFound";
import LanguageSelector from "@/components/language/LanguageSelector";
import { useTranslation } from "react-i18next";
import "./i18n";
import { LogOut } from "lucide-react";
import { Button } from "./components/ui/button";

const queryClient = new QueryClient();

const AppContent = () => {
  const { t } = useTranslation();

  // Logout handler (same as AuthGuard)
  const handleLogout = () => {
    localStorage.removeItem("finance-auth");
    window.location.reload(); // reload to trigger AuthGuard
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center px-4 justify-between">
            <div className="flex items-center">
              <SidebarTrigger className="mr-2" />
              <h1 className="text-lg font-semibold text-foreground">
                {t("dashboard.title")}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector />
              <Button onClick={handleLogout} variant="outline" title="Logout">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/goals" element={<Goals />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthGuard>
          <AppContent />
        </AuthGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
