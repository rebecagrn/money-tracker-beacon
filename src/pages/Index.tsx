import { AuthGuard } from '@/components/auth/AuthGuard';
import { Dashboard } from '@/components/dashboard/Dashboard';

const Index = () => {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
};

export default Index;
