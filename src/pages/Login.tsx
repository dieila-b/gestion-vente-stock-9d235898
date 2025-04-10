
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/hooks/useAuth";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login/LoginForm";
import { TestingModeToggle } from "@/components/auth/login/TestingModeToggle";
import { AuthStatusMessage } from "@/components/auth/login/AuthStatusMessage";
import { DemoCredentials } from "@/components/auth/login/DemoCredentials";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, isDevelopmentMode, testingMode, enableTestingMode, disableTestingMode } = useAuth();
  const [email, setEmail] = useState("wosyrab@yahoo.fr"); // Pré-remplir avec un compte existant
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showTestingControls, setShowTestingControls] = useState(false);
  
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
