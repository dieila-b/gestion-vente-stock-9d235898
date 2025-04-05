
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/hooks/useAuth";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login, loading, isSubmitting, isDevelopmentMode } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    setLocalIsSubmitting(true);
    
    try {
      const result = await login(email, password);
      if (result && !result.success) {
        setErrorMsg(result.error || "Une erreur est survenue lors de la connexion");
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      setErrorMsg("Une erreur inattendue est survenue");
    } finally {
      setLocalIsSubmitting(false);
    }
  };

  // Rediriger immédiatement vers le dashboard en mode développement
  useEffect(() => {
    if (isDevelopmentMode) {
      console.log("Mode développeur: Redirection automatique vers le dashboard");
      navigate("/dashboard", { replace: true });
      return;
    }
    
    // Vérifier l'authentification uniquement en production
    if (isAuthenticated) {
      console.log("Utilisateur déjà authentifié, redirection vers le dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate, isDevelopmentMode]);

  // En mode développement, afficher un chargement simple avant redirection
  if (isDevelopmentMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Mode développeur, redirection automatique...</p>
        </div>
      </div>
    );
  }

  // En production, afficher la page de connexion normale
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Connexion</h1>
          <p className="text-muted-foreground text-sm">
            Accès réservé aux utilisateurs internes
          </p>
        </div>
        
        {errorMsg && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={localIsSubmitting || loading || isSubmitting}
              aria-label="Email"
              autoComplete="email"
              className="bg-card-foreground/5"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={localIsSubmitting || loading || isSubmitting}
              aria-label="Mot de passe"
              autoComplete="current-password"
              className="bg-card-foreground/5"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || localIsSubmitting || isSubmitting}
          >
            {loading || localIsSubmitting || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {localIsSubmitting || isSubmitting ? "Vérification..." : "Connexion..."}
              </>
            ) : (
              "Se connecter"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
