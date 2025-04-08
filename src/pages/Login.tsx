
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
      
      // In development mode, no validation needed
      if (isDevelopmentMode) {
        console.log("Development mode: Automatic login without validation");
        const result = await login("dev@example.com", "password");
        
        if (result.success) {
          toast.success("Connexion réussie (Mode développement)");
          navigate("/dashboard", { replace: true });
        }
        return;
      }
      
      // In production mode, validate inputs
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
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            {isDevelopmentMode 
              ? "Mode développement: Authentification automatique activée" 
              : "Entrez vos identifiants pour accéder à l'application"}
          </CardDescription>
          {isDevelopmentMode && (
            <div className="text-sm p-2 bg-green-100 text-green-800 rounded-md">
              Mode développement: Cliquez simplement sur Se connecter pour accéder à l'application
            </div>
          )}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!isDevelopmentMode && (
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
                isDevelopmentMode ? "Accéder à l'application" : "Se connecter"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
