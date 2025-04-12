
import { useAuth } from '@/components/auth/AuthProvider';

export const useCatalogAuth = () => {
  const { isAuthenticated, loading } = useAuth();

  return { isAuthenticated, loading };
};
