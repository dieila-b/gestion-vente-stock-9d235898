
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // En développement, simplement connecter l'utilisateur
    if (process.env.NODE_ENV === 'development') {
      console.log("Mode développement: Connexion directe");
      login("dev@example.com", "password");
      navigate("/dashboard");
      return;
    }
    
    // En production, vérifier les identifiants avec Supabase
    setIsSubmitting(true);
    try {
      console.log("Tentative de connexion avec email:", email);
      
      if (!email || !password) {
        toast.error("Veuillez saisir votre email et votre mot de passe");
        setIsSubmitting(false);
        return;
      }
      
      const result = await login(email, password);
      
      if (result.success) {
        console.log("Connexion réussie, redirection vers le dashboard");
        toast.success("Connexion réussie");
        navigate("/dashboard");
      } else {
        console.error("Échec de la connexion:", result.error);
        toast.error(result.error || "Identifiants incorrects");
      }
    } catch (error) {
      console.error("Erreur lors de la tentative de connexion:", error);
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
            {process.env.NODE_ENV === 'development' 
              ? "Mode développement: Connexion automatique" 
              : "Accès réservé aux utilisateurs internes"}
          </p>
        </div>
        
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
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}
          
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
              process.env.NODE_ENV === 'development' ? "Entrer (Mode Dev)" : "Se connecter"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
