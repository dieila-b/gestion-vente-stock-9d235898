
import { Link } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";

export function SidebarFooter() {
  return (
    <div className="mt-auto p-6 space-y-2">
      <Link 
        to="/settings" 
        className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors w-full px-3 py-2 rounded-lg hover:bg-purple-900/30"
      >
        <Settings className="h-5 w-5" />
        <span>Paramètres</span>
      </Link>
      <Link 
        to="/" 
        className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-950"
      >
        <LogOut className="h-5 w-5" />
        <span>Déconnexion</span>
      </Link>
    </div>
  );
}
