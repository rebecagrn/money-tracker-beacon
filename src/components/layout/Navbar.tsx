import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Target, Settings } from "lucide-react";

export const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-bold text-primary">MyFinances</h1>
            <div className="flex space-x-4">
              <Button
                asChild
                variant={isActive("/") ? "default" : "ghost"}
                className="gap-2"
              >
                <Link to="/">
                  <Home className="w-4 h-4" />
                  Dashboard
                </Link>
              </Button>
              <Button
                asChild
                variant={isActive("/goals") ? "default" : "ghost"}
                className="gap-2"
              >
                <Link to="/goals">
                  <Target className="w-4 h-4" />
                  Goals
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
