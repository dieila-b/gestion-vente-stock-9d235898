
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
        // For development purposes only - override auth check
        // This ensures we can test the UI without Supabase auth
        if (process.env.NODE_ENV === 'development') {
          console.log("Development mode: User considered authorized");
          setIsAuthorized(true);
          setIsAuthChecking(false);
          return;
        }

        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, user not authorized");
          setIsAuthorized(false);
          setIsAuthChecking(false);
          return;
        }
        
        // Check if the user has admin role by querying the internal_users table
        const { data: userData, error: userError } = await supabase
          .from('internal_users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (userError) {
          console.error("Error checking user role:", userError);
          setIsAuthorized(false);
        } else if (userData) {
          // Only allow admin users to access the internal users page
          const isAdmin = userData.role === 'admin';
          console.log(`User role: ${userData.role}, isAdmin: ${isAdmin}`);
          setIsAuthorized(isAdmin);
        } else {
          console.log("No user data found");
          setIsAuthorized(false);
        }
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
