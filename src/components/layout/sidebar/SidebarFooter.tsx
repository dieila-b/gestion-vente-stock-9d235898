
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/components/auth/AuthProvider";
import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export const SidebarFooter = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  // Créer les initiales pour l'avatar
  const initials = `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`;
  
  // Formater le nom complet
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Utilisateur";
  
  // Formater le rôle pour l'affichage
  const formattedRole = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Employé";

  return (
    <div className="mt-auto p-4">
      <Separator className="mb-4" />
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            {user.photo_url ? <AvatarImage src={user.photo_url} alt={fullName} /> : null}
            <AvatarFallback>{initials || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{fullName}</span>
            <span className="text-xs text-muted-foreground">{formattedRole}</span>
          </div>
        </div>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/settings")}
            title="Paramètres"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Déconnexion"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
