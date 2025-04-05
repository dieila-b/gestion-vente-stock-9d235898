
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  
  // Immédiatement rediriger vers le dashboard
  useEffect(() => {
    console.log("Authentification désactivée: Redirection automatique vers le dashboard");
    toast.success("Connexion automatique");
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-lg font-medium">Redirection automatique...</p>
      </div>
    </div>
  );
}
