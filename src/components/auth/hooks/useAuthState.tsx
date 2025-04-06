
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const isDevelopmentMode = import.meta.env.DEV;

  useEffect(() => {
    if (isDevelopmentMode) {
      console.log("Development mode: Authentication disabled - all users are automatically authenticated");
      // En développement, créer des utilisateurs de démonstration si non existants
      try {
        const existingUsers = localStorage.getItem('internalUsers');
        if (!existingUsers) {
          const demoUsers = [
            {
              id: "dev-1743844624581",
              first_name: "Dieila",
              last_name: "Barry",
              email: "wosyrab@gmail.com",
              phone: "623268781",
              address: "Matam",
              role: "admin",
              is_active: true,
              photo_url: null
            },
            {
              id: "dev-1743853323494",
              first_name: "Dieila",
              last_name: "Barry",
              email: "wosyrab@yahoo.fr",
              phone: "623268781",
              address: "Madina",
              role: "manager",
              is_active: true,
              photo_url: null
            }
          ];
          localStorage.setItem('internalUsers', JSON.stringify(demoUsers));
          console.log("Données utilisateurs de démo créées et stockées dans localStorage");
        } else {
          console.log("Utilisateurs de démonstration existants trouvés dans localStorage");
        }
      } catch (err) {
        console.error("Erreur lors de la création des données démo:", err);
      }
      
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    // Production mode - check actual authentication status
    const checkAuthStatus = async () => {
      try {
        console.log("Checking authentication status...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking authentication:", error);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        // Check if session exists and is valid
        const hasValidSession = !!data?.session;
        console.log("Auth session check:", hasValidSession ? "User is authenticated" : "No active session");
        
        if (hasValidSession) {
          // Verify if the authenticated user is in internal_users table
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              console.log("Auth user found:", user.id, user.email);
              let internalUser = null;
              let internalUserError = null;
              
              // Try to find user by email first
              if (user.email) {
                const emailResult = await supabase
                  .from('internal_users')
                  .select('id, email, is_active, role')
                  .eq('email', user.email.toLowerCase())
                  .maybeSingle();
                  
                internalUser = emailResult.data;
                internalUserError = emailResult.error;
                
                if (internalUserError || !internalUser) {
                  console.log("User not found by email, trying by ID...");
                  
                  // Try to find by ID
                  const idResult = await supabase
                    .from('internal_users')
                    .select('id, email, is_active, role')
                    .eq('id', user.id)
                    .maybeSingle();
                    
                  internalUser = idResult.data;
                  internalUserError = idResult.error;
                }
              } else {
                // Try by ID if no email
                const idResult = await supabase
                  .from('internal_users')
                  .select('id, email, is_active, role')
                  .eq('id', user.id)
                  .maybeSingle();
                  
                internalUser = idResult.data;
                internalUserError = idResult.error;
              }
              
              if (internalUserError || !internalUser) {
                console.error("User not found in internal_users table:", internalUserError?.message || "No user found");
                setIsAuthenticated(false);
              } else if (!internalUser.is_active) {
                console.error("User account is not active");
                setIsAuthenticated(false);
              } else {
                console.log("Valid internal user found:", internalUser.email || internalUser.id, "Role:", internalUser.role);
                setIsAuthenticated(true);
              }
            } else {
              setIsAuthenticated(false);
            }
          } catch (verifyError) {
            console.error("Error verifying internal user:", verifyError);
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Auth state check error:", error);
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    // Setup auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, !!session);
        
        if (session) {
          // Verify the user is in internal_users table
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              let internalUser = null;
              let internalUserError = null;
              
              // Try to find user by email first
              if (user.email) {
                const emailResult = await supabase
                  .from('internal_users')
                  .select('id, email, is_active, role')
                  .eq('email', user.email.toLowerCase())
                  .maybeSingle();
                  
                internalUser = emailResult.data;
                internalUserError = emailResult.error;
                
                if (internalUserError || !internalUser) {
                  console.log("User not found by email, trying by ID...");
                  
                  // Try to find by ID
                  const idResult = await supabase
                    .from('internal_users')
                    .select('id, email, is_active, role')
                    .eq('id', user.id)
                    .maybeSingle();
                    
                  internalUser = idResult.data;
                  internalUserError = idResult.error;
                }
              } else {
                // Try by ID if no email
                const idResult = await supabase
                  .from('internal_users')
                  .select('id, email, is_active, role')
                  .eq('id', user.id)
                  .maybeSingle();
                  
                internalUser = idResult.data;
                internalUserError = idResult.error;
              }
              
              if (internalUserError || !internalUser) {
                console.error("User not found in internal_users table:", internalUserError?.message || "No user found");
                setIsAuthenticated(false);
              } else if (!internalUser.is_active) {
                console.error("User account is not active");
                setIsAuthenticated(false);
              } else {
                console.log("Valid internal user found:", internalUser.email || internalUser.id, "Role:", internalUser.role);
                setIsAuthenticated(true);
              }
            } else {
              setIsAuthenticated(false);
            }
          } catch (verifyError) {
            console.error("Error verifying internal user:", verifyError);
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
        }
        
        setLoading(false);
      }
    );

    // Initial auth check
    checkAuthStatus();

    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [isDevelopmentMode]);

  return { 
    isAuthenticated, 
    setIsAuthenticated, 
    loading, 
    setLoading, 
    isDevelopmentMode 
  };
}
