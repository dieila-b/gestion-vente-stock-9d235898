
import { useAuth } from '@/components/auth/hooks/useAuth';

export const useCatalogAuth = () => {
  const { isDevelopmentMode } = useAuth();

  // En mode développement, toujours considérer comme authentifié et chargé
  return { 
    isAuthenticated: true, 
    loading: false 
  };
};
