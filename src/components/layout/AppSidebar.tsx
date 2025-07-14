import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  Target,
  TrendingUp,
  FileText,
  Calculator,
  BarChart3,
  Upload,
  CreditCard,
  PieChart,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  
  const mainItems = [
    { title: t('navigation.dashboard'), url: "/", icon: Home },
    { title: t('navigation.goals'), url: "/goals", icon: Target },
  ];

  const dashboardItems = [
    { title: t('dashboard.overview'), url: "/?tab=overview", icon: BarChart3 },
    { title: t('dashboard.transactions'), url: "/?tab=transactions", icon: FileText },
    { title: t('dashboard.importBills'), url: "/?tab=import", icon: Upload },
    { title: t('dashboard.forecast'), url: "/?tab=forecast", icon: TrendingUp },
  ];

  const toolsItems = [
    { title: t('dashboard.netIncome'), url: "/?section=calculator", icon: Calculator },
    { title: t('dashboard.spendingAnalysis'), url: "/?section=chart", icon: PieChart },
  ];
  const currentPath = location.pathname;
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get("tab");
  const currentSection = searchParams.get("section");

  // For now, we'll assume sidebar is not collapsed. Can be enhanced later with state management
  const collapsed = false;

  const isActive = (path: string) => {
    if (path === "/")
      return currentPath === "/" && !currentTab && !currentSection;
    if (path.includes("tab=")) {
      const tabMatch = path.match(/tab=([^&]*)/);
      return currentPath === "/" && currentTab === tabMatch?.[1];
    }
    if (path.includes("section=")) {
      const sectionMatch = path.match(/section=([^&]*)/);
      return currentPath === "/" && currentSection === sectionMatch?.[1];
    }
    return currentPath === path;
  };

  const getNavClass = (path: string) =>
    isActive(path)
      ? "bg-sidebar-accent text-sidebar-primary font-medium"
      : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 finance-gradient rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">
                MyFinances
              </h2>
              <p className="text-xs text-muted-foreground">Personal Finance</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass(item.url)}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentPath === "/" && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {dashboardItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={getNavClass(item.url)}
                        >
                          <item.icon className="w-4 h-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {toolsItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          className={getNavClass(item.url)}
                        >
                          <item.icon className="w-4 h-4" />
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
