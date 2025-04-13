
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SidebarFooter() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  return (
    <div className="mt-auto p-4 border-t border-muted/20">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
          {user?.photo_url ? (
            <img 
              src={user.photo_url} 
              alt={`${user.first_name} ${user.last_name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{user?.first_name?.charAt(0) || ''}{user?.last_name?.charAt(0) || ''}</span>
          )}
        </div>
        <div className="ml-3 overflow-hidden">
          <p className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 text-xs" 
          onClick={handleSettings}
        >
          <Settings className="mr-1 h-3 w-3" />
          Paramètres
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 text-xs text-destructive hover:text-destructive/90 hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-1 h-3 w-3" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
