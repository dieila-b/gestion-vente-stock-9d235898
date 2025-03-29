
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth as useGlobalAuth } from "@/components/auth/AuthProvider";

export const useAuth = () => {
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { isAuthenticated } = useGlobalAuth();

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthChecking(true);
      try {
        // For development purposes, allow access if authenticated
        if (isAuthenticated) {
          setIsAuthorized(true);
          setIsAuthChecking(false);
          return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthorized(false);
          setIsAuthChecking(false);
          return;
        }
        
        const { data: userData, error: userError } = await supabase
          .from('internal_users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (userError || !userData) {
          console.error("Error checking user role:", userError);
          setIsAuthorized(false);
          setIsAuthChecking(false);
          return;
        }
        
        setIsAuthorized(userData.role === 'admin');
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthorized(false);
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    checkAuth();
  }, [isAuthenticated]);

  return {
    isAuthChecking,
    isAuthorized
  };
};
