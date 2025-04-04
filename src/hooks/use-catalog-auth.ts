
import { useAuth } from '@/components/auth/hooks/useAuth';

export const useCatalogAuth = () => {
  const { isAuthenticated, loading } = useAuth();

  return { isAuthenticated, loading };
};
