import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const auth = localStorage.getItem('finance-auth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    
    // Simple password check - you can enhance this with proper encryption
    if (password === 'finance123' || password.length >= 6) {
      localStorage.setItem('finance-auth', 'authenticated');
      setIsAuthenticated(true);
      toast({
        title: 'Welcome back!',
        description: 'Successfully logged into your finance dashboard.',
      });
    } else {
      toast({
        title: 'Access denied',
        description: 'Please enter a valid password (minimum 6 characters).',
        variant: 'destructive',
      });
    }
    
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('finance-auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (isAuthenticated) {
    return (
      <div className="relative">
        {children}
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="fixed top-4 right-4 z-50"
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen dashboard-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 finance-card animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 finance-gradient rounded-2xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Finance Control</h1>
          <p className="text-muted-foreground">
            Secure access to your personal finance dashboard
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Demo: Use "finance123" or any password with 6+ characters
            </p>
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading || password.length < 6}
            className="w-full finance-gradient"
          >
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </Button>
        </div>
      </Card>
    </div>
  );
};