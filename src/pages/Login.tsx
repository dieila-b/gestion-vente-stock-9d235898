
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/hooks/useAuth";
import { Loader2, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login, loading, isSubmitting: authSubmitting } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Utilisateur déjà authentifié, redirection vers le dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (process.env.NODE_ENV === 'development') {
      console.log("Mode développement: Connexion directe");
      setIsSubmitting(true);
      try {
        const result = await login("dev@example.com", "password");
        if (result.success) {
          toast.success("Connexion réussie (mode développement)");
          navigate("/dashboard");
        } else {
          console.error("Échec de la connexion en mode dev:", result.error);
          setError(result.error || "Erreur lors de la connexion");
          toast.error(result.error || "Erreur lors de la connexion");
        }
      } catch (error) {
        console.error("Exception en mode développement:", error);
        toast.error("Erreur lors de la connexion");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    
    // Validation des champs en production
    if (!email || !password) {
      setError("Veuillez saisir votre email et votre mot de passe");
      toast.error("Veuillez saisir votre email et votre mot de passe");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Tentative de connexion avec email:", email);
      const result = await login(email, password);
      console.log("Résultat login:", result.success ? "Succès" : "Échec", result.error);
      
      if (result.success) {
        console.log("Connexion réussie, redirection vers le dashboard");
        toast.success("Connexion réussie");
        navigate("/dashboard");
      } else {
        console.error("Échec de la connexion:", result.error);
        setError(result.error || "Identifiants incorrects");
        toast.error(result.error || "Identifiants incorrects");
      }
    } catch (error) {
      console.error("Exception lors de la tentative de connexion:", error);
      setError("Une erreur est survenue. Veuillez réessayer plus tard.");
      toast.error("Une erreur est survenue. Veuillez réessayer plus tard.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitting = isSubmitting || authSubmitting || loading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Connexion</h1>
          <p className="text-muted-foreground text-sm">
            {process.env.NODE_ENV === 'development' 
              ? "Mode développement: Connexion automatique" 
              : "Accès réservé aux utilisateurs internes"}
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {process.env.NODE_ENV !== 'development' && (
            <>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitting}
                  aria-label="Email"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={submitting}
                  aria-label="Mot de passe"
                />
              </div>
            </>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSubmitting ? "Vérification..." : "Connexion..."}
              </>
            ) : (
              process.env.NODE_ENV === 'development' ? "Entrer (Mode Dev)" : "Se connecter"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
