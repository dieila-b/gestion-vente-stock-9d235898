
import { useAuth } from '@/components/auth/AuthProvider';

export const useCatalogAuth = () => {
  const { isAuthenticated, loading, user } = useAuth();

  return { isAuthenticated, loading, user };
};
