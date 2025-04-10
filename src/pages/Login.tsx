
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/hooks/useAuth";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login/LoginForm";
import { TestingModeToggle } from "@/components/auth/login/TestingModeToggle";
import { AuthStatusMessage } from "@/components/auth/login/AuthStatusMessage";
import { DemoCredentials } from "@/components/auth/login/DemoCredentials";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, isDevelopmentMode, testingMode, enableTestingMode, disableTestingMode } = useAuth();
  const [email, setEmail] = useState("wosyrab@yahoo.fr"); // Pré-remplir avec un compte existant
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showTestingControls, setShowTestingControls] = useState(false);
  
  // Vérifier directement la présence de l'utilisateur dans la base de données au chargement
  useEffect(() => {
    const checkUserExistsInDatabase = async () => {
      const normalizedEmail = email.toLowerCase().trim();
      console.log("Vérification initiale de l'existence de:", normalizedEmail);
      
      try {
        // Vérifier dans internal_users
        const { data: internalUsers, error: internalError } = await supabase
          .from('internal_users')
          .select('id, email, is_active')
          .eq('email', normalizedEmail)
          .limit(1);
          
        if (internalError) {
          console.error("Erreur lors de la vérification initiale dans internal_users:", internalError);
          return;
        }
        
        if (!internalUsers || internalUsers.length === 0) {
          console.log("Utilisateur non trouvé avec eq dans internal_users, tentative avec ilike");
          
          const { data: fuzzyUsers, error: fuzzyError } = await supabase
            .from('internal_users')
            .select('id, email, is_active')
            .ilike('email', normalizedEmail)
            .limit(1);
            
          if (fuzzyError) {
            console.error("Erreur lors de la recherche flexible:", fuzzyError);
            return;
          }
          
          if (fuzzyUsers && fuzzyUsers.length > 0) {
            console.log("Utilisateur trouvé avec ilike:", fuzzyUsers[0]);
          } else {
            console.error("ATTENTION: L'utilisateur", normalizedEmail, "n'existe pas dans internal_users");
          }
        } else {
          console.log("Utilisateur trouvé dans internal_users:", internalUsers[0]);
        }
        
        // Vérifier dans auth.users via Supabase Auth
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
          
          if (authError) {
            console.error("Erreur lors de la vérification dans auth.users:", authError);
            return;
          }
          
          // Fix TypeScript error by properly typing the users array
          if (authData && authData.users) {
            // Explicitly cast users to any array first, then map to correct type
            const users = Array.isArray(authData.users) ? authData.users as any[] : [];
            
            const authUser = users.find(u => 
              u && typeof u === 'object' && 'email' in u && 
              typeof u.email === 'string' && u.email.toLowerCase() === normalizedEmail
            );
            
            if (authUser) {
              console.log("Utilisateur trouvé dans auth.users:", authUser.email);
            } else {
              console.error("ATTENTION: L'utilisateur", normalizedEmail, "n'existe pas dans auth.users");
            }
          }
        } catch (authListError) {
          console.error("Erreur lors de la liste des utilisateurs auth:", authListError);
        }
        
      } catch (error) {
        console.error("Erreur lors de la vérification initiale:", error);
      }
    };
    
    if (!isDevelopmentMode && !testingMode) {
      checkUserExistsInDatabase();
    }
  }, [email, isDevelopmentMode, testingMode]);
  
  // Si déjà authentifié, rediriger vers le dashboard
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log("User already authenticated, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, isAuthenticated, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      setIsSubmitting(true);
      
      // En mode développement ou test, authentification automatique
      if (isDevelopmentMode || testingMode) {
        console.log(isDevelopmentMode 
          ? "Development mode: Auto-authenticating user" 
          : "Testing mode: Auto-authenticating user");
        
        const result = await login(email, password);
        
        if (result.success) {
          const modeMessage = isDevelopmentMode ? "Mode développement" : "Mode test";
          toast.success(`Connexion réussie (${modeMessage})`);
          navigate("/dashboard", { replace: true });
        } else if (result.error) {
          setLoginError(result.error);
          toast.error(result.error);
        }
        setIsSubmitting(false);
        return;
      }
      
      // Validation des champs en mode production
      if (!email.trim()) {
        setLoginError("Veuillez saisir votre email");
        toast.error("Veuillez saisir votre email");
        setIsSubmitting(false);
        return;
      }

      if (!password) {
        setLoginError("Veuillez saisir votre mot de passe");
        toast.error("Veuillez saisir votre mot de passe");
        setIsSubmitting(false);
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      console.log("Tentative de connexion avec:", normalizedEmail);

      // Vérifier directement la présence de l'utilisateur dans la base de données
      const { data: internalUsers, error: internalError } = await supabase
        .from('internal_users')
        .select('id, email, is_active')
        .eq('email', normalizedEmail)
        .limit(1);
        
      if (internalError) {
        console.error("Erreur lors de la vérification dans internal_users:", internalError);
        setLoginError("Erreur de vérification: " + internalError.message);
        setIsSubmitting(false);
        return;
      }
      
      if (!internalUsers || internalUsers.length === 0) {
        console.log("Utilisateur non trouvé avec eq, tentative avec ilike");
        
        const { data: fuzzyUsers, error: fuzzyError } = await supabase
          .from('internal_users')
          .select('id, email, is_active')
          .ilike('email', normalizedEmail)
          .limit(1);
          
        if (fuzzyError) {
          console.error("Erreur lors de la recherche flexible:", fuzzyError);
        }
        
        if (!fuzzyUsers || fuzzyUsers.length === 0) {
          console.error("Utilisateur non trouvé dans internal_users:", normalizedEmail);
          setLoginError("Cet email n'est pas associé à un compte utilisateur interne");
          toast.error("Cet email n'est pas associé à un compte utilisateur interne");
          setIsSubmitting(false);
          return;
        }
        
        if (!fuzzyUsers[0].is_active) {
          console.error("Utilisateur désactivé:", fuzzyUsers[0].email);
          setLoginError("Ce compte utilisateur a été désactivé");
          toast.error("Ce compte a été désactivé");
          setIsSubmitting(false);
          return;
        }
        
        console.log("Utilisateur trouvé avec ilike et actif:", fuzzyUsers[0]);
      } else if (!internalUsers[0].is_active) {
        console.error("Utilisateur désactivé:", internalUsers[0].email);
        setLoginError("Ce compte utilisateur a été désactivé");
        toast.error("Ce compte a été désactivé");
        setIsSubmitting(false);
        return;
      } else {
        console.log("Utilisateur trouvé et actif:", internalUsers[0]);
      }

      const result = await login(normalizedEmail, password);
      console.log("Résultat de la connexion:", result);

      if (result.success) {
        toast.success("Connexion réussie");
        navigate("/dashboard", { replace: true });
      } else {
        setLoginError(result.error || "Échec de la connexion");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setLoginError("Une erreur est survenue lors de la connexion");
      toast.error("Une erreur est survenue lors de la connexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Afficher les contrôles de test en appuyant 5 fois sur le titre
  const handleTitleClick = () => {
    const clickCount = parseInt(localStorage.getItem('testing_mode_clicks') || '0') + 1;
    localStorage.setItem('testing_mode_clicks', clickCount.toString());
    
    if (clickCount >= 5) {
      setShowTestingControls(true);
      localStorage.setItem('testing_mode_clicks', '0');
      toast.info("Mode test activé", {
        description: "Vous pouvez maintenant activer/désactiver le mode test"
      });
    }
  };

  // Si toujours en chargement, afficher un spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold cursor-pointer" onClick={handleTitleClick}>Connexion</CardTitle>
          <AuthStatusMessage 
            isDevelopmentMode={isDevelopmentMode} 
            testingMode={testingMode} 
          />
          <DemoCredentials 
            isDevelopmentMode={isDevelopmentMode}
            testingMode={testingMode}
          />
          
          {showTestingControls && !isDevelopmentMode && (
            <TestingModeToggle 
              testingMode={testingMode}
              enableTestingMode={enableTestingMode}
              disableTestingMode={disableTestingMode}
              isDevelopmentMode={isDevelopmentMode}
            />
          )}
        </CardHeader>
        
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          loginError={loginError}
          isDevelopmentMode={isDevelopmentMode}
          testingMode={testingMode}
        />
      </Card>
    </div>
  );
}
