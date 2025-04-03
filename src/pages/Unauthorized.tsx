
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md p-8 bg-card rounded-lg shadow-lg text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold">Accès Non Autorisé</h1>
        
        <p className="text-muted-foreground">
          Seuls les utilisateurs internes autorisés peuvent accéder à cette application.
          Si vous êtes un utilisateur interne, veuillez vous connecter avec vos identifiants.
        </p>
        
        <div className="pt-4">
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => navigate("/login")}
          >
            Retour à la page de connexion
          </Button>
        </div>
      </div>
    </div>
  );
}
