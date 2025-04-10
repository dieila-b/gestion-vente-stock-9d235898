
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, isDevelopmentMode, testingMode, enableTestingMode, disableTestingMode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      
      // In development or testing mode, no validation needed
      if (isDevelopmentMode || testingMode) {
        console.log(isDevelopmentMode 
          ? "Development mode: Automatic login without validation" 
          : "Testing mode: Automatic login without validation in production");
        const result = await login("dev@example.com", "password");
        
        if (result.success) {
          toast.success(isDevelopmentMode 
            ? "Connexion réussie (Mode développement)" 
            : "Connexion réussie (Mode test)");
          navigate("/dashboard", { replace: true });
        }
        return;
      }
      
      // In normal production mode, validate inputs
      if (!email.trim()) {
        setLoginError("Veuillez saisir votre email");
        toast.error("Veuillez saisir votre email");
        return;
      }

      if (!password) {
        setLoginError("Veuillez saisir votre mot de passe");
        toast.error("Veuillez saisir votre mot de passe");
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();
      console.log("Attempting login with:", normalizedEmail);

      const result = await login(normalizedEmail, password);
      console.log("Login result:", result);

      if (result.success) {
        toast.success("Connexion réussie");
        navigate("/dashboard", { replace: true });
      } else {
        setLoginError(result.error || "Échec de la connexion");
        toast.error(result.error || "Échec de la connexion");
      }
    } catch (error) {
      console.error("Login error:", error);
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
          <CardDescription>
            {isDevelopmentMode 
              ? "Mode développement: Authentification automatique activée" 
              : testingMode 
                ? "Mode test: Authentification automatique activée en production" 
                : "Entrez vos identifiants pour accéder à l'application"}
          </CardDescription>
          {(isDevelopmentMode || testingMode) && (
            <div className={`text-sm p-2 ${testingMode ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"} rounded-md mt-2`}>
              {isDevelopmentMode 
                ? "Mode développement: Cliquez simplement sur Se connecter pour accéder à l'application" 
                : "Mode test: Bypass d'authentification activé en production"}
            </div>
          )}
          
          {showTestingControls && !isDevelopmentMode && (
            <div className="mt-4 p-2 border border-dashed border-yellow-400 rounded-md">
              <div className="flex items-center justify-between">
                <Label htmlFor="testing-mode" className="font-medium text-sm">
                  Mode test en production
                </Label>
                <Switch 
                  id="testing-mode" 
                  checked={testingMode}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      enableTestingMode();
                      toast.success("Mode test activé", {
                        description: "L'authentification est maintenant contournée"
                      });
                    } else {
                      disableTestingMode();
                      toast.info("Mode test désactivé", {
                        description: "L'authentification normale est restaurée"
                      });
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ⚠️ Le mode test contourne l'authentification. Utiliser uniquement pour le développement.
              </p>
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!isDevelopmentMode && !testingMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="votre@email.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </>
            )}
            {loginError && (
              <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md">
                {loginError}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Connexion en cours...
                </>
              ) : (
                isDevelopmentMode 
                  ? "Accéder à l'application" 
                  : testingMode 
                    ? "Accéder à l'application (Mode test)" 
                    : "Se connecter"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
