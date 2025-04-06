
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading, isDevelopmentMode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  useEffect(() => {
    if (isDevelopmentMode) {
      // En mode développement, proposer de rediriger vers le dashboard mais ne pas le faire automatiquement
      console.log("Development mode: Login page is available for testing");
      
      // Si déjà authentifié, alors rediriger
      if (isAuthenticated && !loading) {
        navigate("/dashboard", { replace: true });
      }
      return;
    } 
    
    // If already authenticated in production mode, redirect to dashboard
    if (isAuthenticated && !loading) {
      console.log("Production mode: User already authenticated, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, isDevelopmentMode, isAuthenticated, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    
    // Validation
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

    try {
      setIsSubmitting(true);
      const normalizedEmail = email.trim().toLowerCase();
      console.log("Attempting login with:", normalizedEmail);
      
      // Mode production normal ou développement
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

  // If still loading, show loading spinner
  if (loading && !isDevelopmentMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  // In development or production mode, show login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Entrez vos identifiants pour accéder à l'application
          </CardDescription>
          {isDevelopmentMode && (
            <div className="mt-2 text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-md">
              Mode développement: Vous pouvez utiliser les emails de test suivants:
              <div className="mt-1 font-medium">wosyrab@gmail.com ou wosyrab@yahoo.fr</div>
              <div className="mt-1">(Mot de passe peut être n'importe quoi en dev mode)</div>
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
            {loginError && (
              <div className="text-sm font-medium text-destructive">
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
                "Se connecter"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
