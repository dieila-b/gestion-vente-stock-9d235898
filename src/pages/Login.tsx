
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/hooks/useAuth";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("Utilisateur déjà authentifié, redirection vers le dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    
    setIsSubmitting(true);
    
    try {
      console.log("Tentative de connexion avec email:", email);
      
      if (!email || !password) {
        console.error("Formulaire incomplet - Email ou mot de passe manquant");
        setErrorMsg("Veuillez saisir votre email et votre mot de passe");
        toast.error("Veuillez saisir votre email et votre mot de passe");
        setIsSubmitting(false);
        return;
      }
      
      console.log("Appel de la fonction login avec les identifiants fournis");
      const result = await login(email, password);
      console.log("Résultat login:", result);
      
      if (result.success) {
        console.log("Connexion réussie, redirection vers le dashboard");
        toast.success("Connexion réussie");
        navigate("/dashboard");
      } else {
        console.error("Échec de la connexion:", result.error);
        setErrorMsg(result.error || "Identifiants incorrects");
        toast.error(result.error || "Identifiants incorrects");
      }
    } catch (error) {
      console.error("Exception lors de la tentative de connexion:", error);
      setErrorMsg("Une erreur est survenue. Veuillez réessayer plus tard.");
      toast.error("Une erreur est survenue. Veuillez réessayer plus tard.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
            {errorMsg}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting || loading}
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
              disabled={isSubmitting || loading}
              aria-label="Mot de passe"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isSubmitting ? "Vérification..." : "Connexion..."}
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
