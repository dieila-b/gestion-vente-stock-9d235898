
import { useAuth } from '@/components/auth/hooks/useAuth';

export const useCatalogAuth = () => {
  const { isAuthenticated, loading, isDevelopmentMode } = useAuth();

  return { 
    isAuthenticated: isDevelopmentMode ? true : isAuthenticated, 
    loading: isDevelopmentMode ? false : loading 
  };
};
