
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
  
  // In development mode, immediately redirect to dashboard
  useEffect(() => {
    if (isDevelopmentMode) {
      console.log("Development mode: Automatic redirect to dashboard");
      toast.success("Automatic login in development mode");
      navigate("/dashboard", { replace: true });
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
    
    if (!email || !password) {
      toast.error("Veuillez saisir votre email et mot de passe");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Attempting login with:", email);
      
      const result = await login(email, password);
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

  // If in development mode or still loading, show loading spinner
  if (isDevelopmentMode || (loading && !isDevelopmentMode)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-lg font-medium">
            {isDevelopmentMode ? "Development mode: Automatic redirect..." : "Chargement..."}
          </p>
        </div>
      </div>
    );
  }

  // In production mode, show login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Entrez vos identifiants pour accéder à l'application
          </CardDescription>
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
