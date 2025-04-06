
import { useState, useEffect } from 'react';
import { checkUserPermissions } from './user-actions/utils/authorization';

export const useAuth = () => {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  useEffect(() => {
    const verifyPermissions = async () => {
      try {
        console.log("Vérification des permissions utilisateur...");
        const hasPermission = await checkUserPermissions(['admin', 'manager']);
        console.log("Résultat de la vérification des permissions:", hasPermission);
        setIsAuthorized(hasPermission);
      } catch (error) {
        console.error("Erreur lors de la vérification des permissions:", error);
        setIsAuthorized(false);
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    verifyPermissions();
  }, []);
  
  return { 
    isAuthChecking, 
    isAuthorized 
  };
};
