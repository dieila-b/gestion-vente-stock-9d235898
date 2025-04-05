
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  // Rediriger si on est sur la page login
  useEffect(() => {
    console.log("Authentification désactivée: Accès complet accordé automatiquement");
    
    // Si on est sur la page login, rediriger vers dashboard
    if (window.location.pathname === "/login") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // Toujours donner accès complet sans vérification
  console.log("Authentification désactivée: Accès complet accordé automatiquement");
  return <>{children}</>;
}
