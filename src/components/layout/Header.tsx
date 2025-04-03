
import { useAuth } from "@/components/auth/AuthProvider";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const { logout, userEmail } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="border-b flex items-center justify-between px-6 py-4">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg">Système de Gestion</h1>
      </div>
      
      <div className="flex items-center gap-4">
        {userEmail && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm">{userEmail}</span>
          </div>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </header>
  );
};
