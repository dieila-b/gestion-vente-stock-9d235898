
import { useAuth } from '@/components/auth/hooks/useAuth';

export const useCatalogAuth = () => {
  const { isAuthenticated, loading, isDevelopmentMode } = useAuth();

  // En mode développement, toujours considérer comme authentifié et chargé
  return { 
    isAuthenticated: isDevelopmentMode ? true : isAuthenticated, 
    loading: isDevelopmentMode ? false : loading 
  };
};
